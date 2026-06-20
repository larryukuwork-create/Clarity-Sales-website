import { getAccessToken } from '../auth';

export const createDriveFolder = async (folderName: string, parentId?: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {})
  };

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create folder: ${err}`);
  }

  const data = await res.json();
  return data.id;
};

export const createGoogleDoc = async (title: string, parentFolderId?: string, htmlContent?: string): Promise<string> => {
   const token = await getAccessToken();
   if (!token) throw new Error("Not authenticated");

   // If we need to write HTML content, we can use multipart upload to the Drive API
   if (htmlContent) {
       const boundary = 'foo_bar_baz';
       const metadata = {
           name: title,
           mimeType: 'application/vnd.google-apps.document',
           ...(parentFolderId ? { parents: [parentFolderId] } : {})
       };

       const requestBody = `
--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify(metadata)}
--${boundary}
Content-Type: text/html; charset=UTF-8

${htmlContent}
--${boundary}--
`;

       const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
           method: 'POST',
           headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': `multipart/related; boundary=${boundary}`,
           },
           body: requestBody
       });

       if (!res.ok) {
           throw new Error('Failed to create doc');
       }
       const data = await res.json();
       return data.id;
   }

   const metadata = {
     name: title,
     mimeType: 'application/vnd.google-apps.document',
     ...(parentFolderId ? { parents: [parentFolderId] } : {})
   };

   const res = await fetch('https://www.googleapis.com/drive/v3/files', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify(metadata)
   });
   
   if (!res.ok) throw new Error('Failed to create doc');
   const data = await res.json();
   return data.id;
};

export const createGoogleSheet = async (title: string, csvContent: string): Promise<string> => {
   const token = await getAccessToken();
   if (!token) throw new Error("Not authenticated");

   const boundary = 'foo_bar_baz';
   const metadata = {
       name: title,
       mimeType: 'application/vnd.google-apps.spreadsheet'
   };

   const requestBody = `
--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify(metadata)}
--${boundary}
Content-Type: text/csv; charset=UTF-8

${csvContent}
--${boundary}--
`;

   const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
       method: 'POST',
       headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': `multipart/related; boundary=${boundary}`,
       },
       body: requestBody
   });

   if (!res.ok) {
       throw new Error('Failed to create sheet');
   }
   const data = await res.json();
   return data.id;
};
