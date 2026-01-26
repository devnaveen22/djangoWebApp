import React, { useState } from 'react';
import { Gift, Trophy, Users, Camera, Award, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { prizes } from '../utils/priceList';

export default function Home() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);


  const handleImageClick = (prize) => {
    setSelectedPrize(prize);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPrize(null);
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .carousel-item img {
          cursor: pointer;
          width: 100%;
          height: 500px;
          object-fit: cover;
        }
        
        @media (max-width: 768px) {
          .carousel-item img {
            height: 300px;
          }
        }

        .bg-gradient-purple {
          background: linear-gradient(135deg, #5B21B6 0%, #4C1D95 50%, #1E3A8A 100%);
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          mix-blend-mode: multiply;
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
.carousel-control-prev-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='gold' viewBox='0 0 16 16'%3E%3Cpath d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3E%3C/svg%3E");
}

.carousel-control-next-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='gold' viewBox='0 0 16 16'%3E%3Cpath d='M4.646 14.354a.5.5 0 0 1 0-.708L10.293 8 4.646 2.354a.5.5 0 1 1 .708-.708l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708 0z'/%3E%3C/svg%3E");
}
      `}</style>

      <div className="min-vh-100 bg-gradient-purple position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden">
          <div className="blob" style={{top: '80px', left: '80px', width: '288px', height: '288px', background: '#FBBF24'}}></div>
          <div className="blob" style={{bottom: '80px', right: '80px', width: '384px', height: '384px', background: '#EC4899'}}></div>
          <div className="blob" style={{top: '50%', left: '50%', width: '320px', height: '320px', background: '#A855F7'}}></div>
        </div>

        <div className="position-relative" style={{zIndex: 10}}>
          <div className="text-center pt-5 pb-4 px-3">
            <div className="d-inline-flex align-items-center justify-content-center bg-gradient-warning rounded-circle mb-4 animate-float" style={{width: '96px', height: '96px'}}>
              <Trophy size={48} color="white" />
            </div>
            <h1 className="display-3 fw-bold text-white mb-3">
              <span className="text-warning">SRM LOTTO</span>
            </h1>
            <p className="h3 text-warning mb-4">
              வெற்றி உங்களுடையதாகட்டும்!
            </p>
            <div className="bg-gradient-warning rounded-4 p-4 mx-auto" style={{maxWidth: '400px'}}>
              <p className="h2 fw-bold text-white mb-2">
                Token Price: ₹5,000
              </p>
              <p className="text-white fw-semibold mb-0">
                Advance: ₹2,000 | Balance: ₹3,000
              </p>
            </div>
          </div>

          <div className="container" style={{maxWidth:'100%'}}>
            <div className="glass-effect rounded-4 py-4 px-2 shadow-lg mb-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-warning p-3 rounded-3">
                  <Trophy size={32} color="#000" />
                </div>
                <h2 className="h2 fw-bold text-white mb-0">
                  பரிசு விவரங்கள் (Prize Details)
                </h2>
              </div>

              <div 
                id="carouselExampleCaptions" 
                className="carousel slide mx-auto rounded-3" 
                data-bs-ride="carousel"
                style={{boxShadow: '0px 5px 15px 4px #FBBF24'}}
              >
                <div className="carousel-indicators">
                  {prizes.map((_, indx) => (
                    <button
                      key={indx}
                      type="button"
                      data-bs-target="#carouselExampleCaptions"
                      data-bs-slide-to={indx}
                      className={indx === 0 ? "active" : ""}
                      aria-current={indx === 0 ? "true" : undefined}
                      aria-label={`Slide ${indx + 1}`}
                    />
                  ))}
                </div>

                <div className="carousel-inner rounded-3">
                  {prizes.map((prize, indx) => (
                    <div
                      className={`carousel-item ${indx === 0 ? "active" : ""}`}
                      key={indx}
                    >
                      <img
                        src={prize.img}
                        className="d-block w-100"
                        alt={prize.name}
                        onClick={() => handleImageClick(prize)}
                        style={{cursor: 'pointer'}}
                      />
                      <div className="carousel-caption d-block bg-dark bg-opacity-75 rounded-3 py-2">
                        <h5 className="fw-bold">{prize.rank}</h5>
                        <p className="mb-0">{prize.name}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExampleCaptions"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>

                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExampleCaptions"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>

              {openDialog && selectedPrize && (
                <div 
                  className="modal show d-block" 
                  style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
                  onClick={handleCloseDialog}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content bg-gradient-purple border-warning" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header bg-dark bg-opacity-50 border-warning">
                        <h5 className="modal-title text-warning fw-bold">{selectedPrize.name}</h5>
                        <button 
                          type="button" 
                          className="btn-close btn-close-white" 
                          onClick={handleCloseDialog}
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body bg-light d-flex flex-wrap justify-content-between align-items-center">
                        <div className="mb-3">
                          <h6 className="text-purple fw-bold">Brand</h6>
                          <p className="text-dark fs-5 mb-0">{selectedPrize.specs.brand}</p>
                        </div>

                        <div className="mb-3">
                          <h6 className="text-purple fw-bold">Type</h6>
                          <p className="text-dark fs-5 mb-0">{selectedPrize.specs.type}</p>
                        </div>

                        <div className="mb-3">
                          <h6 className="text-purple fw-bold">Value</h6>
                          <p className="text-purple fw-bold fs-4 mb-0">{selectedPrize.specs.value}</p>
                        </div>

                        {selectedPrize.specs.features && selectedPrize.specs.features.length > 0 && (
                          <div>
                            <h6 className="text-purple fw-bold mb-2">Features</h6>
                            <ul className="list-unstyled d-flex flex-wrap justify-content-between align-items-center">
                              {selectedPrize.specs.features.map((feature, idx) => (
                                <li 
                                  key={idx}
                                  className="bg-purple bg-opacity-10 border-start border-4 border-purple rounded p-2 mb-2"
                                >
                                  <CheckCircle size={16} className="text-success me-2" style={{display: 'inline'}} />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="glass-effect rounded-4 p-4 shadow-lg mb-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-warning p-3 rounded-3">
                  <Camera size={32} color="#000" />
                </div>
                <h2 className="h2 fw-bold text-white mb-0">
                  நடத்தும் முறை (Event Procedure)
                </h2>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <div className="glass-effect rounded-3 p-4">
                    <div className="d-flex gap-3">
                      <div className="bg-warning rounded-circle p-2" style={{width: 'fit-content', height: 'fit-content'}}>
                        <Camera size={24} color="#000" />
                      </div>
                      <div className="flex-fill">
                        <h5 className="text-warning fw-bold mb-2">100% Live & Transparent</h5>
                        <p className="text-white mb-0">
                          இந்த நிகழ்ச்சி முழுவதும் <strong>Live முறையில்</strong> நடைபெறும். 
                          நிகழ்ச்சி நடைபெறும் இடத்தில் <strong>CCTV Camera மூலம்</strong> அனைத்தும் 
                          நேரலையாக காண்பிக்கப்படும்.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="glass-effect rounded-3 p-4">
                    <div className="d-flex gap-3">
                      <div className="bg-warning rounded-circle p-2" style={{width: 'fit-content', height: 'fit-content'}}>
                        <Gift size={24} color="#000" />
                      </div>
                      <div className="flex-fill">
                        <h5 className="text-warning fw-bold mb-2">Token Selection Method</h5>
                        <p className="text-white mb-0">
                          ஒரு <strong>சிலிண்ட்ரிக்கல் (Cylinder) வடிவ கண்ணாடி பெட்டி</strong> பயன்படுத்தப்படும். 
                          அதில் அனைத்து டோக்கன்களும் போடப்பட்டு, அனைவரின் முன்னிலையில் சுழற்றப்படும்.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="glass-effect rounded-3 p-4">
                    <div className="d-flex gap-3">
                      <div className="bg-warning rounded-circle p-2" style={{width: 'fit-content', height: 'fit-content'}}>
                        <Users size={24} color="#000" />
                      </div>
                      <div className="flex-fill">
                        <h5 className="text-warning fw-bold mb-2">Audience Selection</h5>
                        <p className="text-white mb-0">
                          நிகழ்ச்சியில் சுமார் <strong>50 பேர் audience</strong> ஆக இருப்பார்கள். 
                          டோக்கன் தேர்வு செய்வது <strong>நாங்கள் அல்ல</strong>. Audience-ல இருக்கிறவர்களே 
                          தங்களாகவே டோக்கனை எடுத்துக் காட்டுவார்கள். தேர்வு முறையில் 
                          <strong> எந்த வகையான கையாடலும் இல்லை</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="glass-effect rounded-3 p-4">
                    <div className="d-flex gap-3">
                      <div className="bg-warning rounded-circle p-2" style={{width: 'fit-content', height: 'fit-content'}}>
                        <Award size={24} color="#000" />
                      </div>
                      <div className="flex-fill">
                        <h5 className="text-warning fw-bold mb-2">Venue</h5>
                        <p className="text-white mb-0">
                          Event நடைபெறும் நாள் (Saturday அல்லது Sunday) 
                          <strong> Mall அல்லது 1000 பேர் capacity உள்ள Mandapam</strong> போன்ற 
                          இடத்தில் நடத்தப்படும்.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-effect rounded-4 p-4 shadow-lg mb-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-warning p-3 rounded-3">
                  <AlertCircle size={32} color="#000" />
                </div>
                <h2 className="h2 fw-bold text-white mb-0">
                  விதிமுறைகள் & நிபந்தனைகள் (Terms & Conditions)
                </h2>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <div className="bg-success bg-opacity-25 rounded-3 p-4 border-start border-4 border-success">
                    <div className="d-flex gap-3">
                      <CheckCircle size={24} className="text-success flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="text-white fw-bold mb-2">1. Token Booking Amount</h5>
                        <p className="text-white mb-0">
                          மொத்த சீட்டு தொகை: <strong>₹5,000</strong><br/>
                          • Advance: <strong>₹2,000</strong><br/>
                          • Balance for Token: <strong>₹3,000</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="bg-primary bg-opacity-25 rounded-3 p-4 border-start border-4 border-primary">
                    <div className="d-flex gap-3">
                      <CheckCircle size={24} className="text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="text-white fw-bold mb-2">2. Event Schedule</h5>
                        <p className="text-white mb-0">
                          <strong>1000 Token</strong> முழுவதும் முடிந்த பிறகே ஒரு நாள் 
                          (Saturday அல்லது Sunday) Event organize செய்யப்படும்.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="bg-info bg-opacity-25 rounded-3 p-4 border-start border-4 border-info">
                    <div className="d-flex gap-3">
                      <CheckCircle size={24} className="text-info flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="text-white fw-bold mb-2">3. Event Venue</h5>
                        <p className="text-white mb-0">
                          Event நடைபெறும் நாள் <strong>Mall அல்லது 1000 பேர் capacity உள்ள Mandapam</strong> 
                          போன்ற இடத்தில் நடத்தப்படும்.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="bg-danger bg-opacity-25 rounded-3 p-4 border-start border-4 border-danger">
                    <div className="d-flex gap-3">
                      <XCircle size={24} className="text-danger flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="text-white fw-bold mb-2">4. No Refund Policy ⚠️</h5>
                        <p className="text-white mb-0">
                          <strong>ஒருமுறை Token book செய்த பிறகு</strong>, "வேண்டாம்" என்று cancel செய்தால் 
                          <strong className="text-danger bg-white "> Amount Refund கிடையாது</strong>. 
                          இது முக்கியமாக குறிப்பிடப்படுகிறது.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="bg-warning bg-opacity-25 rounded-3 p-4 border-start border-4 border-warning">
                    <div className="d-flex gap-3">
                      <AlertCircle size={24} className="text-warning flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="text-white fw-bold mb-2">5. Prize Policy - No Cash Exchange</h5>
                        <p className="text-white mb-3">
                          Event-ல் விழும் பரிசு: <strong>நாங்கள் முன்கூட்டியே சொல்லிய பரிசு தான் வழங்கப்படும்</strong>. 
                          அதற்கு பதிலாக <strong className="text-warning">Cash / பணம் வழங்கப்படாது</strong>.
                        </p>
                        <div className="bg-dark bg-opacity-50 rounded-3 p-3">
                          <p className="text-warning fw-semibold mb-1">உதாரணம்:</p>
                          <p className="text-white mb-0">
                            • Prize Bike என்றால் → Bike book செய்து கொடுக்கப்படும்<br/>
                            • ₹2,00,000 Cash போன்ற மாற்று தொகை வழங்கப்படாது
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="bg-secondary bg-opacity-25 rounded-3 p-4 border-start border-4 border-secondary">
                    <div className="d-flex gap-3">
                      <Gift size={24} className="text-warning flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="text-white fw-bold mb-2">6. Combo Prize Box</h5>
                        <p className="text-white mb-0">
                          <strong>₹3,000 Combo Prize Box</strong> இது குறிப்பிட்ட kitchen items மட்டும் அல்ல. 
                          <strong> எந்த பொருளாகவும் இருக்கலாம்</strong>. Combo Box-ல் என்ன வரும் என்று 
                          முன்கூட்டியே fix இல்லை.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-warning rounded-4 p-4 shadow-lg mb-5">
              <h3 className="h3 fw-bold text-white text-center mb-4">
                முக்கிய குறிப்புகள் (Important Points)
              </h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="bg-white bg-opacity-90 rounded-3 p-3 d-flex align-items-center gap-3">
                    <CheckCircle size={24} className="text-success flex-shrink-0" />
                    <p className="text-dark fw-semibold mb-0">100% Live + CCTV Transparency</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-white bg-opacity-90 rounded-3 p-3 d-flex align-items-center gap-3">
                    <CheckCircle size={24} className="text-success flex-shrink-0" />
                    <p className="text-dark fw-semibold mb-0">Audience மூலம் Token Selection</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-white bg-opacity-90 rounded-3 p-3 d-flex align-items-center gap-3">
                    <XCircle size={24} className="text-danger flex-shrink-0" />
                    <p className="text-dark fw-semibold mb-0">No Refund Policy</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-white bg-opacity-90 rounded-3 p-3 d-flex align-items-center gap-3">
                    <XCircle size={24} className="text-danger flex-shrink-0" />
                    <p className="text-dark fw-semibold mb-0">No Cash Exchange for Prizes</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-white bg-opacity-90 rounded-3 p-3 d-flex align-items-center gap-3">
                    <AlertCircle size={24} className="text-warning flex-shrink-0" />
                    <p className="text-dark fw-semibold mb-0">Event after All Tokens Sold</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-white bg-opacity-90 rounded-3 p-3 d-flex align-items-center gap-3">
                    <Gift size={24} className="text-purple flex-shrink-0" />
                    <p className="text-dark fw-semibold mb-0">Combo Box - Various Items</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pb-5">
              <p className="text-white fs-5 mb-2">
                For more details, contact us or book your token now!
              </p>
              <p className="text-white text-xl font-bold mt-2">
                வெற்றி உங்களுடையதாகட்டும்! 🏆
              </p>
              </div>
              </div>
        </div>
      </div>
      </>
              );
            };