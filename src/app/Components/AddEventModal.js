import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from '../config/config';

export default function AddEventModal({ show, handleClose, allEvents, selectedDate, refreshEvents, preFilledDate }) {

    const [customAssignToHandle, setCustomAssignToHandle] = useState('');

    const [key, setKey] = useState('customer');
    const [formData, setFormData] = useState({
        customerName: '',
        customerMobile: '',
        customerEmail: '',
        customerAddress: '',
        assignmentName: '',
        assignmentAddress: '',
        contactPerson1Mobile: '',
        assignmentDate: '',
        assignmentTime: '',
        assignTo: 'Me',
        assignToName: 'Me',
        assignToHandle: 'MeTo',
    });
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [customAssignmentName, setCustomAssignmentName] = useState('');

    const uniqueAssignmentNames = [...new Set(allEvents.map(ev => ev.title))];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignmentChange = (e) => {
        const value = e.target.value;
        if (value === 'other') {
            setShowOtherInput(true);
            setFormData(prev => ({ ...prev, assignmentName: '' }));
        } else {
            setShowOtherInput(false);
            setFormData(prev => ({ ...prev, assignmentName: value }));
        }
    };

    const handleNextTab = () => {
        if (key === 'customer') setKey('assignment');
        else if (key === 'assignment') setKey('assignto');
    };

    const handleSubmit = async () => {

        if (formData.assignTo === 'Other' && !customAssignToHandle.trim()) {
            return alert("Please enter a name for 'Assign To'");
        }

        const dateTime = new Date(`${formData.assignmentDate}T${formData.assignmentTime}`);
        const accessToken = JSON.parse(localStorage.getItem('camrilla_token'))?.accessToken;
        if (!accessToken) return alert('Missing access token');

        const payload = {
            customerName: formData.customerName,
            customerMobile: formData.customerMobile,
            customerEmail: formData.customerEmail,
            customerAddress: formData.customerAddress,
            assignmentName: showOtherInput ? customAssignmentName : formData.assignmentName,
            assignmentAddress: formData.assignmentAddress,
            assignmentDateTime: dateTime.getTime(),
            assignmentStatus: 'Completed',
            contactPerson1Name: '',
            contactPerson1Mobile: formData.contactPerson1Mobile,
            contactPerson2Name: '',
            contactPerson2Mobile: '',
            assignToName: formData.assignTo,
            assignToHandle: formData.assignTo === 'Me' ? 'MeTo' : customAssignToHandle,
            assignmentNote: '',
            totalAmount: 0,
            reminderBeforedays: 1,
            reminderDate: '',
        };

        // {
        //     headers: { Authorization: `Bearer ${accessToken}` },
        // }

        try {
            const res = await axios.post(`${config.BASE_URL}order/assignment`, payload);
            if (res.data.code === 0) {
                alert('Assignment created successfully');
                handleClose();
                refreshEvents(selectedDate);
            } else {
                alert('Failed: ' + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        }
    };

    useEffect(() => {
        if (show) {
            setFormData({
                customerName: '',
                customerMobile: '',
                customerEmail: '',
                customerAddress: '',
                assignmentName: '',
                assignmentAddress: '',
                contactPerson1Mobile: '',
                assignmentDate: preFilledDate || '',
                assignmentTime: '',
                assignTo: 'Me',
                assignToName: 'Me',
                assignToHandle: 'MeTo',
            });
            setShowOtherInput(false);
            setCustomAssignmentName('');
            setKey('customer'); // reset to first tab
        }
    }, [show, preFilledDate]);

    const validateCustomerTab = () => {
        const { customerName, customerMobile, customerEmail, customerAddress } = formData;
        return customerName && customerMobile && customerEmail && customerAddress;
    };

    const validateAssignmentTab = () => {
        const { assignmentName, assignmentAddress, contactPerson1Mobile, assignmentDate, assignmentTime } = formData;
        const assignmentValid = showOtherInput ? customAssignmentName : assignmentName;
        return assignmentValid && assignmentAddress && contactPerson1Mobile && assignmentDate && assignmentTime;
    };

    const handleTabSelect = (selectedKey) => {
        const tabOrder = ['customer', 'assignment', 'assignto'];
        const currentIndex = tabOrder.indexOf(key);
        const selectedIndex = tabOrder.indexOf(selectedKey);

        if (selectedIndex <= currentIndex) {
            // Allow going backward
            setKey(selectedKey);
        } else {
            // Validate before moving forward
            if (key === 'customer' && validateCustomerTab()) {
                setKey('assignment');
            } else if (key === 'assignment' && validateAssignmentTab()) {
                setKey('assignto');
            } else {
                alert("Please complete all required fields before proceeding.");
            }
        }
    };





    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static"  keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Add Event</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs activeKey={key} onSelect={handleTabSelect} className="mb-3">
                    <Tab eventKey="customer" title="Customer">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer Name</Form.Label>
                                <Form.Control name="customerName" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control name="customerEmail" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile</Form.Label>
                                <Form.Control name="customerMobile" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control name="customerAddress" onChange={handleInputChange} />
                            </Form.Group>
                        </Form>
                    </Tab>
                    <Tab eventKey="assignment" title="Assignment">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Assignment</Form.Label>
                                <Form.Select onChange={handleAssignmentChange} defaultValue="">
                                    <option disabled value="">-- Select Assignment --</option>
                                    {uniqueAssignmentNames.map((name, i) => (
                                        <option key={i} value={name}>{name}</option>
                                    ))}
                                    <option value="other">Other</option>
                                </Form.Select>
                            </Form.Group>
                            {showOtherInput && (
                                <Form.Group className="mb-3">
                                    <Form.Label>New Assignment Name</Form.Label>
                                    <Form.Control onChange={(e) => setCustomAssignmentName(e.target.value)} />
                                </Form.Group>
                            )}
                            <Form.Group className="mb-3">
                                <Form.Label>Venue</Form.Label>
                                <Form.Control name="assignmentAddress" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Alternate Contact</Form.Label>
                                <Form.Control name="contactPerson1Mobile" onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Control
                                type="date"
                                name="assignmentDate"
                                value={formData.assignmentDate}
                                onChange={handleInputChange}
                            />
                            <Form.Group className="mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Control type="time" name="assignmentTime" onChange={handleInputChange} />
                            </Form.Group>
                        </Form>
                    </Tab>
                    <Tab eventKey="assignto" title="Assign To">
                        <Form>
                            <Form.Check
                                type="radio"
                                label="Me"
                                name="assignTo"
                                value="Me"
                                checked={formData.assignTo === 'Me'}
                                onChange={handleInputChange}
                            />
                            <Form.Check
                                type="radio"
                                label="Other"
                                name="assignTo"
                                value="Other"
                                checked={formData.assignTo === 'Other'}
                                onChange={handleInputChange}
                            />
                            {formData.assignTo === 'Other' && (
                                <Form.Group className="mt-2">
                                    <Form.Label>Enter Other Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={customAssignToHandle}
                                        onChange={(e) => setCustomAssignToHandle(e.target.value)}
                                    />
                                </Form.Group>
                            )}
                        </Form>
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                {key === 'assignto' ? (
                    <Button variant="primary" onClick={handleSubmit}>Submit</Button>
                ) : (
                    <Button variant="primary" onClick={handleNextTab} disabled={(key === 'customer' && !validateCustomerTab()) || (key === 'assignment' && !validateAssignmentTab())}>Next</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
