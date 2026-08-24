import os

with open('Code.gs', 'r', encoding='utf-8') as f:
    code = f.read()

# Add get_history action
new_action = '''
    if (payload.action === 'get_history') {
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ "status": "success", "data": [] })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = sheet.getDataRange().getValues();
      const history = [];
      
      for (let i = 1; i < data.length; i++) {
        // Cột K (index 10) là Email
        if (data[i][10] === payload.email) {
          try {
             // Cột cuối cùng (data[i].length - 1) là raw JSON của submission
             const rawStr = data[i][data[i].length - 1];
             if (rawStr && rawStr.startsWith('{')) {
                 const rawObj = JSON.parse(rawStr);
                 history.push({
                     timestamp: data[i][0],
                     warningScore: data[i][12],
                     level: data[i][13],
                     rawAnswers: rawObj
                 });
             }
          } catch(e) {}
        }
      }
      
      // Sắp xếp mới nhất lên đầu
      history.reverse();
      
      return ContentService.createTextOutput(JSON.stringify({ "status": "success", "data": history })).setMimeType(ContentService.MimeType.JSON);
    }
'''

# Insert it before the default action
idx = code.find('// --- DEFAULT ACTION (SUBMIT FORM) ---')
if idx != -1:
    new_code = code[:idx] + new_action + '\n    ' + code[idx:]
    with open('Code.gs', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print('Updated Code.gs')
else:
    print('Marker not found')
