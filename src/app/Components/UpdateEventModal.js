import { useEffect, useState } from 'react';
import { Modal, Form, Button, Tab, Tabs } from 'react-bootstrap';
import axios from 'axios';

export default function UpdateEventModal({ show, handleClose, eventData, refreshEvents, selectedDate, allEvents }) {
    const [formData, setFormData] = useState({});
    const [key, setKey] = useState('customer');
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [customAssignmentName, setCustomAssignmentName] = useState('');

    const uniqueAssignmentNames = [...new Set(allEvents.map(ev => ev.title))];

    useEffect(() => {
        if (eventData) {
            const dateObj = new Date(eventData.assignmentDateTime);
            setFormData({
                customerName: eventData.customerName || '',
                customerMobile: eventData.customerMobile || '',
                customerEmail: eventData.customerEmail || '',
                customerAddress: eventData.customerAddress || '',
                assignmentName: eventData.assignmentName || '',
                assignmentAddress: eventData.assignmentAddress || '',
                contactPerson1Mobile: eventData.contactPerson1Mobile || '',
                assignmentDate: dateObj.toISOString().split('T')[0],
                assignmentTime: dateObj.toTimeString().split(':').slice(0, 2).join(':'),
                assignToName: eventData.assignToName || 'Me',
                assignToHandle: eventData.assignToHandle || 'MeTo',
                assignmentNote: eventData.assignmentNote || '',
                totalAmount: eventData.totalAmount || 0,
            });
            setShowOtherInput(eventData.assignmentName === 'Other');
            setCustomAssignmentName('');
        }
    }, [eventData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignmentChange = (e) => {
        if (e.target.value === 'other') {
            setShowOtherInput(true);
            setFormData(prev => ({ ...prev, assignmentName: '' }));
        } else {
            setShowOtherInput(false);
            setFormData(prev => ({ ...prev, assignmentName: e.target.value }));
        }
    };

    const handleUpdate = async () => {
        const dateTime = new Date(`${formData.assignmentDate}T${formData.assignmentTime}`).getTime();
        const token = JSON.parse(localStorage.getItem('camrilla_token'))?.accessToken;
        if (!token || !eventData?.id) return alert('Missing token or event ID');

        const payload = {
            customerName: formData.customerName,
            customerMobile: formData.customerMobile,
            customerEmail: formData.customerEmail,
            customerAddress: formData.customerAddress,
            assignmentName: showOtherInput ? customAssignmentName : formData.assignmentName,
            assignmentAddress: formData.assignmentAddress,
            assignmentDateTime: dateTime,
            assignmentStatus: 'Completed',
            contactPerson1Name: '',
            contactPerson1Mobile: formData.contactPerson1Mobile,
            contactPerson2Name: '',
            contactPerson2Mobile: '',
            assignToName: formData.assignToName,
            assignToHandle: formData.assignToHandle,
            assignmentNote: formData.assignmentNote,
            totalAmount: formData.totalAmount,
        };

        // , {
        //     headers: { Authorization: `Bearer ${token}` },
        // }

        try {
            const res = await axios.put(`https://api.camrilla.com/order/assignment/${eventData.id}`, payload);
            if (res.data.code === 0) {
                alert('Updated successfully');
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

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;

        const token = JSON.parse(localStorage.getItem('camrilla_token'))?.accessToken;
        if (!token || !eventData?.id) return alert('Missing token or event ID');

        // , {
        //     headers: { Authorization: `Bearer ${token}` },
        // }
        try {
            const res = await axios.delete(`https://api.camrilla.com/order/assignment/${eventData.id}`);
            if (res.data.code === 0) {
                alert('Deleted successfully');
                handleClose();
                refreshEvents(selectedDate);
            } else {
                alert('Failed to delete: ' + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        }
    };


    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Update Assignment</Modal.Title>
                <Button variant="danger" style={{ marginLeft: "20px" }} onClick={handleDelete}>
                    <i class="bi bi-trash-fill"></i> &nbsp;Assignment
                </Button>
            </Modal.Header>
            <Modal.Body>
                <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
                    <Tab eventKey="customer" title="Customer">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control name="customerName" value={formData.customerName} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile</Form.Label>
                                <Form.Control name="customerMobile" value={formData.customerMobile} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control name="customerAddress" value={formData.customerAddress} onChange={handleChange} />
                            </Form.Group>
                        </Form>
                    </Tab>
                    <Tab eventKey="assignment" title="Assignment">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Assignment</Form.Label>
                                <Form.Select onChange={handleAssignmentChange} value={formData.assignmentName || ''}>
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
                                <Form.Control name="assignmentAddress" value={formData.assignmentAddress} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Alternate Contact</Form.Label>
                                <Form.Control name="contactPerson1Mobile" value={formData.contactPerson1Mobile} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control type="date" name="assignmentDate" value={formData.assignmentDate} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Control type="time" name="assignmentTime" value={formData.assignmentTime} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Note</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={6}
                                    name="assignmentNote"
                                    value={formData.assignmentNote}
                                    onChange={handleChange}
                                    placeholder="Type your detailed note here..."
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Total Amount</Form.Label>
                                <Form.Control name="totalAmount" value={formData.totalAmount} onChange={handleChange} type="number" />
                            </Form.Group>
                        </Form>
                    </Tab>
                    <Tab eventKey="assignto" title="Assign To">
                        <Form>
                            <Form.Check
                                type="radio"
                                label="Me"
                                name="assignToName"
                                value="Me"
                                checked={formData.assignToName === 'Me'}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        assignToName: 'Me',
                                        assignToHandle: 'MeTo'
                                    }))
                                }
                            />
                            <Form.Check
                                type="radio"
                                label="Other"
                                name="assignToName"
                                value="Other"
                                checked={formData.assignToName === 'Other'}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        assignToName: 'Other',
                                        assignToHandle: prev.assignToHandle || ''
                                    }))
                                }
                            />

                            {formData.assignToName === 'Other' && (
                                <Form.Group className="mt-3">
                                    <Form.Label>Other Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.assignToHandle}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                assignToHandle: e.target.value
                                            }))
                                        }
                                    />
                                </Form.Group>
                            )}
                        </Form>
                    </Tab>

                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleUpdate}>Update</Button>
            </Modal.Footer>
        </Modal>
    );
}
