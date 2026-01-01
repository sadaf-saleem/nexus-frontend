import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { DocumentChamber, Signature } from '../../types';
import { FileText, Upload, Eye, Download, PenTool, Check, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock storage
const documentChambers: DocumentChamber[] = [];

export const DocumentChamberPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentChamber[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentChamber | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<'contract' | 'deal' | 'agreement' | 'other'>('contract');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const signaturePadRef = useRef<SignatureCanvas>(null);

  React.useEffect(() => {
    if (user) {
      const userDocs = documentChambers.filter(
        doc => doc.ownerId === user.id || doc.participants.includes(user.id)
      );
      setDocuments(userDocs);
    }
  }, [user]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setUploadedFile(file);
        toast.success('File uploaded successfully');
      } else {
        toast.error('Please upload a PDF or image file');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  const createDocument = () => {
    if (!user || !documentName || !uploadedFile) {
      toast.error('Please fill all fields and upload a file');
      return;
    }

    const fileUrl = URL.createObjectURL(uploadedFile);
    const newDoc: DocumentChamber = {
      id: `doc_${Date.now()}`,
      name: documentName,
      type: documentType,
      fileUrl,
      fileSize: uploadedFile.size,
      status: 'draft',
      ownerId: user.id,
      participants: [],
      signatures: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    documentChambers.push(newDoc);
    setDocuments([...documentChambers]);
    setShowUploadModal(false);
    setDocumentName('');
    setUploadedFile(null);
    toast.success('Document created successfully');
  };

  const handleSignDocument = () => {
    if (!selectedDocument || !signaturePadRef.current || !user) return;

    const signatureData = signaturePadRef.current.toDataURL();
    const newSignature: Signature = {
      id: `sig_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      signatureData,
      signedAt: new Date().toISOString()
    };

    const doc = documentChambers.find(d => d.id === selectedDocument.id);
    if (doc) {
      doc.signatures.push(newSignature);
      if (doc.signatures.length >= 2) {
        doc.status = 'signed';
      } else {
        doc.status = 'in_review';
      }
      doc.updatedAt = new Date().toISOString();
      setDocuments([...documentChambers]);
      setSelectedDocument(doc);
      setShowSignatureModal(false);
      signaturePadRef.current.clear();
      toast.success('Document signed successfully');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="gray">Draft</Badge>;
      case 'in_review':
        return <Badge variant="warning">In Review</Badge>;
      case 'signed':
        return <Badge variant="success">Signed</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Manage contracts, deals, and agreements</p>
        </div>
        <Button
          leftIcon={<Upload size={18} />}
          onClick={() => setShowUploadModal(true)}
        >
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <Card className="col-span-full">
            <CardBody>
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FileText size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-600">No documents yet</p>
                <p className="text-sm text-gray-500 mt-1">Upload your first document to get started</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          documents.map(doc => (
            <Card
              key={doc.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedDocument(doc)}
            >
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{doc.type}</p>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {doc.participants.length + 1} participants
                  </span>
                  <span className="flex items-center gap-1">
                    <PenTool size={14} />
                    {doc.signatures.length} signatures
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Eye size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDocument(doc);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDocument.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedDocument.status)}
                    <span className="text-sm text-gray-500">
                      {selectedDocument.type}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Document Preview */}
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={selectedDocument.fileUrl}
                  className="w-full h-96"
                  title={selectedDocument.name}
                />
              </div>

              {/* Signatures */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Signatures</h3>
                {selectedDocument.signatures.length === 0 ? (
                  <p className="text-gray-500 text-sm">No signatures yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDocument.signatures.map(sig => (
                      <div
                        key={sig.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                      >
                        <img
                          src={sig.signatureData}
                          alt={`${sig.userName}'s signature`}
                          className="h-12 border border-gray-300 rounded bg-white"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{sig.userName}</p>
                          <p className="text-sm text-gray-500">
                            Signed on {new Date(sig.signedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Check size={20} className="text-green-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedDocument.status !== 'signed' && (
                  <Button
                    leftIcon={<PenTool size={18} />}
                    onClick={() => setShowSignatureModal(true)}
                  >
                    Sign Document
                  </Button>
                )}
                <Button
                  variant="outline"
                  leftIcon={<Download size={18} />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedDocument.fileUrl;
                    link.download = selectedDocument.name;
                    link.click();
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Document</h2>
            <div className="space-y-4">
              <Input
                label="Document Name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                fullWidth
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="contract">Contract</option>
                  <option value="deal">Deal</option>
                  <option value="agreement">Agreement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (PDF or Image)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                  {uploadedFile ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">
                        Drag and drop a file here, or click to select
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowUploadModal(false);
                    setDocumentName('');
                    setUploadedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button fullWidth onClick={createDocument}>
                  Create Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sign Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Draw your signature
                </label>
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                  <SignatureCanvas
                    ref={signaturePadRef}
                    canvasProps={{
                      className: 'w-full border border-gray-200 rounded',
                      width: 600,
                      height: 200
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => signaturePadRef.current?.clear()}
                >
                  Clear
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowSignatureModal(false);
                    signaturePadRef.current?.clear();
                  }}
                >
                  Cancel
                </Button>
                <Button fullWidth onClick={handleSignDocument}>
                  Sign Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

