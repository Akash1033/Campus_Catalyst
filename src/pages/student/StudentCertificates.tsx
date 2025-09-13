import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const CERTIFICATE_FONT = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Great+Vibes&display=swap';

const StudentCertificates: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inject Google Fonts for certificate
    if (!document.getElementById('certificate-font')) {
      const link = document.createElement('link');
      link.id = 'certificate-font';
      link.rel = 'stylesheet';
      link.href = CERTIFICATE_FONT;
      document.head.appendChild(link);
    }
    const fetchCertificates = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select(`id, issued_at, event_id, events (title, start_time, end_time, location)`) // join event details
          .eq('student_id', user.id);
        if (error) throw error;
        setCertificates(data || []);
      } catch (err) {
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [user]);

  const handlePrint = (certId: string) => {
    const certElem = document.getElementById(`certificate-${certId}`);
    if (certElem) {
      const printWindow = window.open('', '', 'width=900,height=650');
      printWindow?.document.write('<html><head><title>Certificate</title>');
      printWindow?.document.write(`<link href='${CERTIFICATE_FONT}' rel='stylesheet'>`);
      printWindow?.document.write(`
        <style>
          body{margin:0;background:#888;}
          .certificate-bg{background:#fff;max-width:900px;margin:40px auto;padding:0;box-shadow:0 4px 32px #0002;}
          .outer-border{background:linear-gradient(135deg,#1e3a8a 0%,#facc15 100%);padding:18px;border-radius:18px;}
          .middle-border{background:#fff;padding:12px;border-radius:12px;}
          .inner-border{background:linear-gradient(135deg,#fff 80%,#facc15 100%);padding:0;border-radius:8px;}
          .certificate-content{background:#fff;padding:48px 32px 32px 32px;border-radius:8px;box-shadow:0 2px 8px #0001;}
          .cert-title{font-family:Montserrat,sans-serif;font-size:2.5rem;font-weight:700;letter-spacing:0.2rem;text-align:center;color:#222;}
          .cert-subtitle{font-family:Montserrat,sans-serif;font-size:1.2rem;text-align:center;color:#444;margin-bottom:1.5rem;}
          .cert-presented{font-size:1.1rem;text-align:center;margin-bottom:0.5rem;}
          .cert-name{font-family:'Great Vibes',cursive;font-size:2.2rem;text-align:center;color:#1e3a8a;font-weight:400;margin-bottom:0.5rem;}
          .cert-desc{font-size:1rem;text-align:center;color:#444;margin-bottom:1.5rem;}
          .cert-event{font-size:1.1rem;text-align:center;color:#222;margin-bottom:0.5rem;}
          .cert-badge{display:flex;justify-content:center;margin:1.5rem 0;}
          .badge-circle{background:#fff;border:4px solid #facc15;border-radius:50%;width:90px;height:90px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0002;}
          .badge-inner{background:#1e3a8a;color:#fff;border-radius:50%;width:70px;height:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Montserrat,sans-serif;font-size:0.9rem;font-weight:700;}
          .badge-ribbon{width:0;height:0;border-left:18px solid transparent;border-right:18px solid transparent;border-top:28px solid #facc15;margin-top:-8px;}
          .cert-footer{display:flex;justify-content:space-between;align-items:center;margin-top:2.5rem;}
          .cert-signature{width:180px;border-top:2px solid #1e3a8a;text-align:center;font-size:1rem;color:#222;font-family:Montserrat,sans-serif;}
          .cert-date{font-size:1rem;color:#666;text-align:right;}
        </style>
      `);
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(certElem.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
      printWindow?.close();
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Certificates</h1>
        <p className="text-gray-600">Certificates for events you've attended</p>
      </header>
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : certificates.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center">
          <div className="text-4xl text-gray-300 mb-4">🏅</div>
          <h3 className="text-lg font-medium">No certificates found</h3>
          <p className="text-gray-500 mt-1">You haven't received any certificates yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {certificates.map(cert => (
            <div key={cert.id} id={`certificate-${cert.id}`} className="certificate-bg">
              <div className="outer-border">
                <div className="middle-border">
                  <div className="inner-border">
                    <div className="certificate-content">
                      <div className="cert-title">CERTIFICATE</div>
                      <div className="cert-subtitle">OF ACHIEVEMENT</div>
                      <div className="cert-presented">This certificate is proudly presented to</div>
                      <div className="cert-name">{user?.name}</div>
                      <div className="cert-desc">
                        For successfully participating in the event:
                      </div>
                      <div className="cert-event">{cert.events?.title || 'Event'}</div>
                      {cert.events?.location && (
                        <div className="cert-event">Location: {cert.events.location}</div>
                      )}
                      <div className="cert-event">
                        {cert.events?.start_time ? `Date: ${new Date(cert.events.start_time).toLocaleDateString()}` : ''}
                      </div>
                      <div className="cert-badge">
                        <div className="badge-circle">
                          <div className="badge-inner">
                            <span style={{fontSize:'0.8rem'}}>TOP</span>
                            <span style={{fontSize:'1.1rem'}}>BRAND</span>
                            <span style={{fontSize:'0.8rem'}}>AWARD</span>
                          </div>
                        </div>
                      </div>
                      <div className="badge-ribbon" />
                      <div className="cert-footer">
                        <div className="cert-signature">Signature</div>
                        <div className="cert-date">Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'N/A'}</div>
                        <div className="cert-signature">Signature</div>
                      </div>
                      <button
                        className="mt-6 w-full py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition print:hidden"
                        onClick={() => handlePrint(cert.id)}
                      >
                        Print Certificate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates; 