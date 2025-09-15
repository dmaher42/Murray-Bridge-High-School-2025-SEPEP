// Google Apps Script (Code.gs)
const SHEET_ID = '1qF5UKJtUNVSoAaBcM1WiIaSclZzgct8oUkfV73FSF_I';

function doPost(e) {
  const endpoint = e && e.parameter && e.parameter.endpoint;
  if (endpoint !== 'addTeam') return _json({ ok:false, error: 'Unknown endpoint' }, 400);

  try {
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const { teamId = '', teamName = '', neighbourhood = '', division = '' } = body;

    // Basic validation
    if (!teamId || !teamName) return _json({ ok:false, error:'teamId and teamName are required' }, 400);

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sh = ss.getSheetByName('Teams');
    if (!sh) {
      sh = ss.insertSheet('Teams');
      sh.appendRow(['teamId','teamName','neighbourhood','division']);
    }

    sh.appendRow([teamId, teamName, neighbourhood, division]);
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok:false, error: String(err) }, 500);
  }
}

function doGet(e) {
  const endpoint = e && e.parameter && e.parameter.endpoint;
  const ss = SpreadsheetApp.openById(SHEET_ID);

  if (endpoint === 'teams') {
    const sh = ss.getSheetByName('Teams');
    return _json(_sheetToObjects(sh));
  }
  if (endpoint === 'results') {
    const sh = ss.getSheetByName('Results');
    return _json(_sheetToObjects(sh));
  }
  return _json({ ok:false, error:'Unknown endpoint' }, 400);
}

function _sheetToObjects(sh) {
  if (!sh) return [];
  const values = sh.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values.shift();
  return values
    .filter(r => r.join('').trim() !== '')
    .map(row => Object.fromEntries(headers.map((h,i)=>[h,row[i]])));
}

function _json(payload, statusCodeIgnored) {
  // ContentService JSON is valid for Apps Script web apps.
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

