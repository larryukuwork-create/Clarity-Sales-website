import { useEffect } from 'react';
import { db, isFirebaseConfigured } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

export function useLeadTracker(eventType: string) {
  useEffect(() => {
    const track = async () => {
      if (!isFirebaseConfigured) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn("Client is offline. Bypassing remote tracking of event: " + eventType);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const leadId = urlParams.get('lead') || urlParams.get('leadId') || urlParams.get('id');
      const campaignId = urlParams.get('campaign') || urlParams.get('campaignId');
      
      if (!leadId) return;

      try {
        // Find which collection the lead is in
        let collectionName = "outreachLeads";
        let leadRef = doc(db, collectionName, leadId);
        let leadSnap = await getDoc(leadRef);
        
        if (!leadSnap.exists()) {
          collectionName = "intakes";
          leadRef = doc(db, collectionName, leadId);
          leadSnap = await getDoc(leadRef);
        }

        if (leadSnap.exists()) {
          const timestampField = `${eventType}_at`; // e.g. demo_viewed_at, proposal_viewed_at, intake_started_at
          
          const updates: any = {
            last_viewed_at: serverTimestamp(),
            updated_at: serverTimestamp()
          };

          // Only set the specific event timestamp if it hasn't been set yet
          if (!leadSnap.data()[timestampField]) {
             updates[timestampField] = serverTimestamp();
          }

          if (eventType === 'intake_started' && leadSnap.data().status === 'New lead') {
             updates.status = 'Intake Started';
          }
          
          await updateDoc(leadRef, updates);

          // Optionally track the event as an immutable log
          await addDoc(collection(db, "trackingEvents"), {
            lead_id: leadId,
            campaign_id: campaignId || leadSnap.data().campaign_id || null,
            event_type: eventType,
            page_path: window.location.pathname,
            industry: leadSnap.data().industry || 'unknown',
            created_at: serverTimestamp()
          });
        }
      } catch (err) {
        console.warn("Error tracking lead event dynamically:", err);
      }
    };

    track();
  }, [eventType]);
}
