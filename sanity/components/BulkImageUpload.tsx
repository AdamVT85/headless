/**
 * Bulk Image Upload Component for Sanity
 * Allows uploading multiple images at once to an array field
 */

import { useCallback, useState } from 'react';
import { ArrayOfObjectsInputProps, set, insert, useClient } from 'sanity';
import { Button, Card, Flex, Stack, Text, Spinner } from '@sanity/ui';
import { UploadIcon } from '@sanity/icons';

export function BulkImageUpload(props: ArrayOfObjectsInputProps) {
  const { onChange, value = [], schemaType, renderDefault } = props;
  const client = useClient({ apiVersion: '2024-01-01' });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleBulkUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress({ current: 0, total: files.length });

    const newImages: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });

      try {
        // Upload asset to Sanity
        const asset = await client.assets.upload('image', file, {
          filename: file.name,
        });

        // Create image object for array
        newImages.push({
          _type: 'image',
          _key: `${Date.now()}-${i}`,
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    // Add all uploaded images to the array
    if (newImages.length > 0) {
      const currentItems = value || [];
      onChange(set([...currentItems, ...newImages]));
    }

    setUploading(false);
    setProgress({ current: 0, total: 0 });

    // Reset the input
    event.target.value = '';
  }, [client, onChange, value]);

  return (
    <Stack space={4}>
      {/* Bulk Upload Button */}
      <Card padding={4} radius={2} shadow={1} tone="primary">
        <Flex align="center" gap={3}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleBulkUpload}
            style={{ display: 'none' }}
            id="bulk-image-upload"
            disabled={uploading}
          />
          <label htmlFor="bulk-image-upload" style={{ cursor: uploading ? 'wait' : 'pointer', flex: 1 }}>
            <Button
              as="span"
              icon={uploading ? Spinner : UploadIcon}
              text={uploading ? `Uploading ${progress.current}/${progress.total}...` : 'Bulk Upload Images'}
              tone="primary"
              mode="ghost"
              disabled={uploading}
              style={{ width: '100%' }}
            />
          </label>
          <Text size={1} muted>
            Select multiple files at once
          </Text>
        </Flex>
      </Card>

      {/* Default array input for viewing/managing images */}
      {renderDefault(props)}
    </Stack>
  );
}
