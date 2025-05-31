// ./Components/BasicPlanNotice.js
import { Modal, Button, Spinner } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image'; // optional, for logo

export default function BasicPlanNotice({ show, handleClose }) {
  const [professionalPlan, setProfessionalPlan] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get('https://api.camrilla.com/user-plan');
        const plans = response.data?.data?.availablePlans || [];
        const pro = plans.find(p => p.planName?.toLowerCase() === 'professional');
        if (pro) setProfessionalPlan(pro);
      } catch (error) {
        console.error('Error fetching plan data:', error);
      }
    };

    if (show) fetchPlan();
  }, [show]);

  if (!professionalPlan) {
    return (
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" />
        </Modal.Body>
      </Modal>
    );
  }

  const features = JSON.parse(professionalPlan.feature);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0" />
      <Modal.Body className="p-4">
        <div className="row align-items-center">
          {/* LEFT COLUMN */}
          <div className="col-md-5 text-center mb-4 mb-md-0">
            {/* Replace with your actual logo */}
            <Image
              src="/images/logo.png"
              alt="Camrilla Logo"
              width={100}
              height={100}
              className="mb-3"
            />
            <h4 className="fw-bold text-primary">Become Professional</h4>
            <p className="text-muted">{professionalPlan.planDescription}</p>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-md-7">
            <h5 className="fw-semibold mb-3">Get access to:</h5>
            <ul className="list-unstyled mb-4">
              {features.map((f, idx) => (
                <li key={idx} className="mb-2 d-flex align-items-center">
                  <i className="ri-check-line text-success me-2"></i>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="text-success mb-0">₹{professionalPlan.finalAmount}</h4>
                <small className="text-muted text-decoration-line-through">
                  ₹{professionalPlan.monthlyAmount}
                </small>
              </div>
              <Button variant="primary" href="/Subscriptions" onClick={handleClose}>
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
