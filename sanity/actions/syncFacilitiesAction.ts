/**
 * SYNC FACILITIES DOCUMENT ACTION
 *
 * Custom Sanity document action that triggers facility sync from Salesforce.
 * Shows in the document actions menu for the dataSync document type.
 */

import { useCallback, useState } from 'react';
import { DocumentActionProps, useClient } from 'sanity';

// Get the sync secret from environment (must be exposed to client)
const SYNC_SECRET = process.env.NEXT_PUBLIC_SYNC_FACILITIES_SECRET || 'dev-secret-change-me';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function SyncFacilitiesAction(props: DocumentActionProps) {
  const { id, type, published } = props;
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const client = useClient({ apiVersion: '2024-01-01' });

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      // Call the sync API
      const response = await fetch(`${SITE_URL}/api/sync-facilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: SYNC_SECRET,
          syncedBy: 'sanity-studio',
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the Sanity document with sync info
        await client
          .patch(id)
          .set({
            'facilitySyncInfo.lastSyncedAt': new Date().toISOString(),
            'facilitySyncInfo.lastSyncedBy': 'Sanity Studio',
            'facilitySyncInfo.facilitiesCount': result.stats.facilitiesCount,
            'facilitySyncInfo.villasWithFacilities': result.stats.villasWithFacilities,
          })
          .commit();

        setSyncResult(`Synced ${result.stats.facilitiesCount} facilities for ${result.stats.villasWithFacilities} villas`);
      } else {
        setSyncResult(`Error: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncResult(`Error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [id, client]);

  return {
    label: isSyncing ? 'Syncing...' : 'Sync Facilities from Salesforce',
    icon: () => '🔄',
    disabled: isSyncing,
    onHandle: handleSync,
    tone: 'primary' as const,
    // Show result as a toast/dialog
    ...(syncResult && {
      dialog: {
        type: 'confirm' as const,
        message: syncResult,
        onConfirm: () => setSyncResult(null),
        onCancel: () => setSyncResult(null),
      },
    }),
  };
}
