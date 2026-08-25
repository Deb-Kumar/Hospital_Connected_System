import React, { useEffect, useState } from 'react';
import Navbar from '../components/Header/DashboardNavbar';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function MedicalHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadRecords() {
    setLoading(true);
    axiosClient.get(`/patient/${user.id}/records`)
      .then((res) => setRecords(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(loadRecords, [user.id]);

  function handleUpload() {
    // Full build: open a file picker, upload to storage (S3/Cloudinary), then save the returned URL.
    axiosClient.post(`/patient/${user.id}/records`, {
      recordType: 'LAB_REPORT',
      title: 'Blood Test Report',
      fileUrl: 'https://storage.example.com/reports/sample.pdf',
    }).then(loadRecords).catch(() => alert('Upload failed'));
  }

  return (
    <div>
      <Navbar title="Medical History" />
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={handleUpload}
          className="w-full sm:w-auto bg-primary text-white px-5 py-2.5 rounded-lg font-medium mb-6 hover:bg-primaryDark transition"
        >
          Upload Report / Record
        </button>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-500">No records uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div key={r._id} className="bg-white rounded-lg shadow p-4">
                <p className="font-semibold text-gray-900">{r.title}</p>
                <p className="text-sm text-gray-500">{r.recordType}</p>
                <p className="text-sm text-gray-600 italic mt-1">{r.aiSummary}</p>
                <a href={r.fileUrl} target="_blank" rel="noreferrer"
                  className="text-primary text-sm font-medium mt-2 inline-block">
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
