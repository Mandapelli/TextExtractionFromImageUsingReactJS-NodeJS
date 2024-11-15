// src/components/ImageToBase64.js
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const ImageToBase64 = () => {
  const [base64String, setBase64String] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      setFileName(file.name);

      const base64 = await convertToBase64(file);
      setBase64String(base64);
      setPreviewUrl(base64);
    } catch (error) {
      console.error('Error converting image:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64String)
      .then(() => alert('Base64 string copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Image to Base64 Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg border-gray-300">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700">Choose an image</span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
            {fileName && <p className="mt-2 text-sm text-gray-500">{fileName}</p>}
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full h-auto max-h-64 rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Base64 Output:</p>
                <div className="relative">
                  <textarea
                    value={base64String}
                    readOnly
                    className="w-full h-32 p-2 text-sm font-mono bg-gray-50 rounded-lg"
                  />
                  <Button 
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageToBase64;
