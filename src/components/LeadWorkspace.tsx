import React, { useState } from 'react';
import { createDriveFolder, createGoogleDoc } from '../lib/workspace';
import { Folder, FileText, UploadCloud, RefreshCw } from 'lucide-react';
import { getAccessToken, googleSignIn } from '../auth';

export default function LeadWorkspace({ lead, onUpdateLead }: { lead: any, onUpdateLead: (id: string, updates: any) => void }) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [pdfLinkInput, setPdfLinkInput] = useState('');

  const handleCreateFolder = async () => {
    setIsCreatingFolder(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        await googleSignIn();
      }
      
      const parentName = `Clarity Space Clients`;
      const folderName = lead.business_name || lead.businessName || lead.contact_name || lead.contactName || 'Client';

      let rootFolderId = null;

      // We should really find the root folder "Clarity Space Clients" by searching, but for now we can just search or create it.
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${parentName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, {
         headers: { Authorization: `Bearer ${await getAccessToken()}` }
      });
      const searchData = await searchRes.json();
      
      if (searchData.files && searchData.files.length > 0) {
         rootFolderId = searchData.files[0].id;
      } else {
         rootFolderId = await createDriveFolder(parentName);
      }

      // Create client folder
      const clientFolderId = await createDriveFolder(folderName, rootFolderId);
      
      // Create Subfolders
      const intakeId = await createDriveFolder('01 Intake', clientFolderId);
      const brandAssetsId = await createDriveFolder('02 Brand Assets', clientFolderId);
      const websiteContentId = await createDriveFolder('03 Website Content', clientFolderId);
      const proposalId = await createDriveFolder('04 Proposal', clientFolderId);
      const buildScreenshotsId = await createDriveFolder('05 Build Screenshots', clientFolderId);
      const launchHandoverId = await createDriveFolder('06 Launch Handover', clientFolderId);

      onUpdateLead(lead.id, {
        google_drive_folder_id: clientFolderId,
        google_drive_folder_url: `https://drive.google.com/drive/folders/${clientFolderId}`,
        google_drive_created_at: new Date().toISOString(),
        google_drive_status: 'Created',
        google_drive_subfolders: {
           intake: `https://drive.google.com/drive/folders/${intakeId}`,
           brand_assets: `https://drive.google.com/drive/folders/${brandAssetsId}`,
           website_content: `https://drive.google.com/drive/folders/${websiteContentId}`,
           proposal: `https://drive.google.com/drive/folders/${proposalId}`,
           build_screenshots: `https://drive.google.com/drive/folders/${buildScreenshotsId}`,
           launch_handover: `https://drive.google.com/drive/folders/${launchHandoverId}`
        }
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create drive folders. Ensure you are signed into Google.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleCreateDoc = async () => {
    setIsCreatingDoc(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        await googleSignIn();
      }
      const title = `Proposal: ${lead.business_name || lead.businessName || 'Client'}`;
      
      // We need to pass the parent folder ID if it exists:
      let parentId;
      if (lead.google_drive_subfolders?.proposal) {
         // extract ID from URL
         const url = lead.google_drive_subfolders.proposal;
         parentId = url.split('/').pop();
      }

      const htmlContent = `
        <h1>Clarity Space Proposal</h1>
        <p><strong>Business:</strong> ${lead.business_name || lead.businessName}</p>
        <p><strong>Contact:</strong> ${lead.contact_name || lead.contactName}</p>
        <p><strong>Industry:</strong> ${lead.industry}</p>
        <h2>Project Goals</h2>
        <p>[Insert goals here]</p>
        <h2>Scope</h2>
        <p>[Insert scope here]</p>
        <h2>Assets Checklist</h2>
        <ul>
           <li>Logo: [ ]</li>
           <li>Content: [ ]</li>
           <li>Images: [ ]</li>
        </ul>
        <h2>Quote & Timeline</h2>
        <p>[Insert quote]</p>
      `;

      const docId = await createGoogleDoc(title, parentId, htmlContent);
      onUpdateLead(lead.id, {
        google_doc_proposal_id: docId,
        google_doc_proposal_url: `https://docs.google.com/document/d/${docId}/edit`,
        proposal_doc_created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create proposal doc");
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const handleSavePdf = () => {
     if (pdfLinkInput) {
        onUpdateLead(lead.id, {
           proposal_pdf_url: pdfLinkInput,
           proposal_pdf_created_at: new Date().toISOString()
        });
        setPdfLinkInput('');
     }
  };

  return (
    <div className="pt-4 border-t border-slate-800">
      <h4 className="text-[10px] uppercase font-mono text-cyan-500 mb-3">Google Workspace</h4>
      
      {/* Drive Folder details */}
      <div className="mb-4">
         {!lead.google_drive_folder_id ? (
            <button 
              onClick={handleCreateFolder} 
              disabled={isCreatingFolder}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-800 transition disabled:opacity-50"
            >
              {isCreatingFolder ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Folder className="w-4 h-4" />}
              Create Client Drive Folder
            </button>
         ) : (
            <div className="space-y-2">
               <a href={lead.google_drive_folder_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition">
                  <Folder className="w-4 h-4" /> Open Client Folder
               </a>
               {lead.google_drive_subfolders && (
                 <div className="grid grid-cols-2 gap-2 mt-2">
                    <a href={lead.google_drive_subfolders.intake} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 hover:text-white transition line-clamp-1">01 Intake</a>
                    <a href={lead.google_drive_subfolders.brand_assets} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 hover:text-white transition line-clamp-1">02 Brand Assets</a>
                    <a href={lead.google_drive_subfolders.website_content} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 hover:text-white transition line-clamp-1">03 Content</a>
                    <a href={lead.google_drive_subfolders.proposal} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 hover:text-white transition line-clamp-1">04 Proposal</a>
                    <a href={lead.google_drive_subfolders.build_screenshots} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 hover:text-white transition line-clamp-1">05 Build</a>
                    <a href={lead.google_drive_subfolders.launch_handover} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 hover:text-white transition line-clamp-1">06 Handover</a>
                 </div>
               )}
            </div>
         )}
      </div>

      {/* Docs Proposal details */}
      <div className="mb-4">
         {!lead.google_doc_proposal_url ? (
            <button 
              onClick={handleCreateDoc} 
              disabled={isCreatingDoc || !lead.google_drive_folder_id}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-800 transition disabled:opacity-50"
              title={!lead.google_drive_folder_id ? "Create Drive folder first" : ""}
            >
              {isCreatingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Create Google Doc Proposal
            </button>
         ) : (
            <a href={lead.google_doc_proposal_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition">
              <FileText className="w-4 h-4" /> Open Proposal Doc
            </a>
         )}
      </div>

      {/* PDF Storage details */}
      <div>
         {!lead.proposal_pdf_url ? (
            <div className="flex flex-col gap-1">
               <label className="text-[10px] text-slate-500 font-mono">Paste Final Proposal PDF Drive Link</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={pdfLinkInput}
                   onChange={e => setPdfLinkInput(e.target.value)}
                   className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white" 
                   placeholder="https://drive.google.com/..."
                 />
                 <button onClick={handleSavePdf} className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">Save</button>
               </div>
            </div>
         ) : (
            <a href={lead.proposal_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition">
              <UploadCloud className="w-4 h-4" /> View Final PDF
            </a>
         )}
      </div>

      {/* Google Drive Safety Panel */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
         <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono">
               <span className="text-slate-500">Folder Visibility:</span>
               <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">Private by Default</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono">
               <span className="text-slate-500">Sharing Status:</span>
               <span className="text-cyan-400 font-medium">Admin & Owner Only</span>
            </div>
            <p className="text-[9px] text-slate-550 leading-normal">
               🔒 <strong>Reminder:</strong> Google Drive folders and generated proposal Google Docs are strictly restricted to your private admin storage. Never change standard directory permissions to public unless explicitly intentional.
            </p>
         </div>
      </div>

    </div>
  );
}
