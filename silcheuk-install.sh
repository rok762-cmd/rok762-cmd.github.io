#!/usr/bin/env bash
# 실측 스튜디오 서버 설치 (Ubuntu 24.04 + Caddy) — 같은 명령을 다시 실행해도 안전합니다.
#   사용: curl -fsSL https://rok762-cmd.github.io/silcheuk-install.sh | sudo bash
#   도메인 지정: ... | sudo SITE=app.회사.co.kr bash
set -euo pipefail
REPO=rok762-cmd/silcheuk-studio
DIR=/var/www/silcheuk-studio
KEY=/root/.ssh/silcheuk_deploy

[ "$(id -u)" = 0 ] || { echo "root 로 실행하세요 (sudo bash)"; exit 1; }

echo "== 1/5 프로그램 설치"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git python3 caddy curl >/dev/null

echo "== 2/5 GitHub 접근 키"
mkdir -p /root/.ssh && chmod 700 /root/.ssh
[ -f "$KEY" ] || ssh-keygen -t ed25519 -N '' -C "silcheuk-server" -f "$KEY" >/dev/null
grep -q 'Host silcheuk-gh' /root/.ssh/config 2>/dev/null || cat >>/root/.ssh/config <<EOF
Host silcheuk-gh
  HostName github.com
  User git
  IdentityFile $KEY
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
EOF
if ! git ls-remote "silcheuk-gh:$REPO.git" >/dev/null 2>&1; then
  echo
  echo "▶ 아래 한 줄(ssh-ed25519 로 시작)을 복사해서 Claude 에게 보내 주세요. 등록 후 이 명령을 다시 실행하면 됩니다."
  echo
  cat "$KEY.pub"
  echo
  exit 2
fi

echo "== 3/5 코드 받기 + 빌드"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" pull -q
else
  mkdir -p /var/www
  git clone -q "silcheuk-gh:$REPO.git" "$DIR"
fi
[ -f "$DIR/.env" ] || cp "$DIR/.env.example" "$DIR/.env"
python3 "$DIR/build/build.py" >/dev/null
ls "$DIR/dist/index.html" >/dev/null

echo "== 4/5 Caddy 설정"
if [ -z "${SITE:-}" ]; then
  IP=$(curl -4 -fsS https://api.ipify.org || hostname -I | awk '{print $1}')
  SITE="$(echo "$IP" | tr . -).sslip.io"
fi
cat >/etc/caddy/Caddyfile <<EOF
$SITE {
	root * $DIR/dist
	encode zstd gzip
	@fresh path / /index.html /sw.js /version.json /manifest.webmanifest
	header @fresh Cache-Control "no-cache"
	header /manifest.webmanifest Content-Type application/manifest+json
	@static path *.png
	header @static Cache-Control "public, max-age=604800"
	header X-Content-Type-Options nosniff
	header Referrer-Policy strict-origin-when-cross-origin
	file_server
}
EOF
caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1
systemctl enable -q caddy
systemctl reload caddy 2>/dev/null || systemctl restart caddy

echo "== 5/5 방화벽"
if command -v ufw >/dev/null && ufw status | grep -q active; then
  ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null
fi

sleep 5
CODE=$(curl -s -o /dev/null -w '%{http_code}' "https://$SITE/" || true)
echo
echo "완료 ✅  주소: https://$SITE/   (응답 $CODE — 처음엔 인증서 발급에 30초쯤 걸릴 수 있음)"
echo "업데이트: 같은 명령을 다시 실행하면 됩니다."
