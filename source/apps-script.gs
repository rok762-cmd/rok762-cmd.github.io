/**
 * 실측 스튜디오 · 구글 드라이브 수신기 (v4)
 * - 태블릿 → 드라이브: 현장·사진·PDF 자동 업로드 (action: file)
 * - 사무실 → 태블릿: '보낼현장' 폴더에 올린 현장을 태블릿이 받아감 (action: inbox / take)
 * - 드라이브 현장 목록: 어느 기기에서든 드라이브의 현장을 열어 이어서 작업 (action: list / get)
 * - 본사 단가·제품 일괄 배포: 본사가 올린 단가를 모든 태블릿이 받아감 (action: cat-put / cat-get)
 * 설치: script.google.com → 새 프로젝트 → 이 내용 전부 붙여넣기 → KEY 바꾸기 → 배포 → 새 배포 → 웹 앱
 *       (실행 계정: 나 / 액세스: 모든 사용자). 예전 버전을 쓰고 있었다면 '배포 관리 → 수정 → 새 버전'으로 같은 주소를 유지하세요.
 */
const KEY = '여기에-비밀번호';
const ROOT = '실측스튜디오';

function root_() { const it = DriveApp.getFoldersByName(ROOT); return it.hasNext() ? it.next() : DriveApp.createFolder(ROOT); }
function sub_(parent, name) { const it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet() { return out_({ ok: true, app: 'silcheuk', v: 4 }); }

function doPost(e) {
  try {
    const p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (p.key !== KEY) return out_({ ok: false, error: 'key' });
    const r = root_();
    if (p.action === 'ping') return out_({ ok: true, v: 4 });
    if (p.action === 'cat-put') {
      const f = sub_(r, '설정'), old = f.getFilesByName('catalog.json');
      while (old.hasNext()) old.next().setTrashed(true);
      f.createFile(Utilities.newBlob(String(p.json || ''), 'application/json', 'catalog.json'));
      return out_({ ok: true });
    }
    if (p.action === 'cat-get') {
      const fs = sub_(r, '설정').getFilesByName('catalog.json');
      if (!fs.hasNext()) return out_({ ok: true, json: '' });
      return out_({ ok: true, json: fs.next().getBlob().getDataAsString('UTF-8') });
    }
    if (p.action === 'list') {
      const g = sub_(r, '현장'), it = g.getFolders(), items = [];
      while (it.hasNext()) {
        const f = it.next(), fs = f.getFilesByName('현장정보.json');
        if (!fs.hasNext()) continue;
        items.push({ folder: f.getName(), at: fs.next().getLastUpdated().getTime() });
      }
      items.sort(function (a, b) { return b.at - a.at; });
      return out_({ ok: true, v: 4, items: items.slice(0, 300) });
    }
    if (p.action === 'get') {
      const f = sub_(sub_(r, '현장'), String(p.folder)), fs = f.getFilesByName('현장정보.json');
      if (!fs.hasNext()) return out_({ ok: false, error: 'none' });
      const json = fs.next().getBlob().getDataAsString('UTF-8'), photos = {}, it = f.getFiles();
      while (it.hasNext()) { const x = it.next(); if (/^사진_\d+\.jpg$/.test(x.getName())) photos[x.getName()] = Utilities.base64Encode(x.getBlob().getBytes()); }
      return out_({ ok: true, json: json, photos: photos });
    }
    if (p.action === 'file') {
      let f = sub_(r, String(p.group || '현장'));
      if (p.folder) f = sub_(f, String(p.folder));
      const name = String(p.name || 'file');
      const old = f.getFilesByName(name);
      while (old.hasNext()) old.next().setTrashed(true);
      const blob = Utilities.newBlob(Utilities.base64Decode(p.b64 || ''), p.mime || 'application/octet-stream', name);
      const file = f.createFile(blob);
      return out_({ ok: true, id: file.getId() });
    }
    if (p.action === 'email') {
      const att = Utilities.newBlob(Utilities.base64Decode(p.b64 || ''), 'application/pdf', String(p.name || '견적서.pdf'));
      GmailApp.sendEmail(String(p.to), String(p.subject || ''), String(p.body || ''), { attachments: [att], name: String(p.from || '') });
      return out_({ ok: true });
    }
    if (p.action === 'inbox') {
      const f = sub_(r, '보낼현장'), it = f.getFiles(), files = [];
      let size = 0;
      while (it.hasNext() && files.length < 10) {
        const x = it.next(), bytes = x.getBlob().getBytes();
        if (files.length && size + bytes.length > 20000000) break;
        size += bytes.length;
        files.push({ fid: x.getId(), name: x.getName(), at: x.getLastUpdated().getTime(), b64: Utilities.base64Encode(bytes) });
      }
      return out_({ ok: true, files: files });
    }
    if (p.action === 'take') {
      const x = DriveApp.getFileById(String(p.fid));
      x.moveTo(sub_(r, '받은현장'));
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  }
}
