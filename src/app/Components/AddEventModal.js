import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from '../config/config';
import BasicPlanNotice from './BasicPlanNotice';
import { useAssignmentStore } from '../store/store';

const MAX_NOTE_LENGTH = 300; // ✅ character limit

export default function AddEventModal({
    show,
    handleClose,
    allEvents,
    selectedDate,
    refreshEvents,
    preFilledDate,
    triggerBasicPlanModal
}) {

    const { incrementAssignmentCount } = useAssignmentStore();

    const [customAssignToHandle, setCustomAssignToHandle] = useState('');
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [customAssignmentName, setCustomAssignmentName] = useState('');

    const [key, setKey] = useState('customer');

    // Calculate min and max dates for the date picker
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today.getFullYear() + 10, today.getMonth(), today.getDate()).toISOString().split('T')[0];

    // -----------------------------  
    // FORM STATE (✅ added assignmentNote)
    // -----------------------------
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
        assignmentNote: '',          // ✅ NEW
    });

    // -----------------------------  
    // VALIDATION ERRORS  
    // -----------------------------
    const [errors, setErrors] = useState({});

    const uniqueAssignmentNames = [...new Set(allEvents.map(ev => ev.title))];

    // -----------------------------
    // HANDLE FIELD INPUT
    // -----------------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Handler for text inputs to reject inputs starting with space or containing only spaces
    const handleTextInputChange = (e) => {
        const { name, value } = e.target;
        // Reject if starts with space or is only spaces
        if (value.startsWith(' ') || value.trim() === '') {
            return; // Do not update state
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // ✅ Separate handler for note (to manage char count & limits)
    const handleNoteChange = (e) => {
    let value = e.target.value;

    // 🚫 Hard limit at 300 chars + alert
    if (value.length > MAX_NOTE_LENGTH) {
        alert(`Maximum ${MAX_NOTE_LENGTH} characters allowed.`);
        value = value.slice(0, MAX_NOTE_LENGTH); // keep only first 300
    }

    setFormData(prev => ({ ...prev, assignmentNote: value }));

    if (!value.trim()) {
        setErrors(prev => ({ ...prev, assignmentNote: 'Note is required.' }));
    } else {
        // we already trimmed to <= MAX_NOTE_LENGTH, so no length error now
        setErrors(prev => ({ ...prev, assignmentNote: '' }));
    }
};


    // -----------------------------
    // ASSIGNMENT SELECT HANDLER
    // -----------------------------
    const handleAssignmentChange = (e) => {
        const value = e.target.value;
        if (value === 'other') {
            setShowOtherInput(true);
            setFormData(prev => ({ ...prev, assignmentName: '' }));
        } else {
            setShowOtherInput(false);
            setFormData(prev => ({ ...prev, assignmentName: value }));
        }

        setErrors(prev => ({ ...prev, assignmentName: '' }));
    };

    // -----------------------------
    // VALIDATION HELPERS
    // -----------------------------
    const isEmpty = (v) => !v || v.trim() === "";

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !email.trim()) return "Email is required.";
        if (!re.test(email.trim())) return "Enter a valid email address.";
        return "";
    };

    const validateMobile = (m) => {
        if (!m || !m.trim()) return "Mobile number is required.";
        if (!/^\d+$/.test(m)) return "Only digits allowed.";
        if (m.length < 6) return "Mobile number too short.";
        if (m.length > 15) return "Mobile number too long.";
        return "";
    };

    const validateDate = (date) => {
        if (!date) return "Date is required.";
        const selected = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selected < today) return "Date cannot be in the past.";
        return "";
    };

    // -----------------------------
    // FULL TAB VALIDATIONS
    // -----------------------------
    const validateCustomerTab = () => {
        const e = {};

        if (isEmpty(formData.customerName)) e.customerName = "Customer name is required.";
        const emailErr = validateEmail(formData.customerEmail);
        if (emailErr) e.customerEmail = emailErr;
        const mobileErr = validateMobile(formData.customerMobile);
        if (mobileErr) e.customerMobile = mobileErr;
        if (isEmpty(formData.customerAddress) || formData.customerAddress.length < 2)
            e.customerAddress = "Address must be at least 2 characters.";

        setErrors(prev => ({ ...prev, ...e }));
        return Object.keys(e).length === 0;
    };

    const validateAssignmentTab = () => {
        const e = {};

        const assignmentValid = showOtherInput ? customAssignmentName : formData.assignmentName;

        if (isEmpty(assignmentValid))
            e.assignmentName = "Assignment name is required.";

        if (isEmpty(formData.assignmentAddress) || formData.assignmentAddress.length < 2)
            e.assignmentAddress = "Venue must be at least 2 characters.";

        const altErr = validateMobile(formData.contactPerson1Mobile);
        if (altErr) e.contactPerson1Mobile = altErr;

        const dateErr = validateDate(formData.assignmentDate);
        if (dateErr) e.assignmentDate = dateErr;

        if (isEmpty(formData.assignmentTime))
            e.assignmentTime = "Time is required.";

        // ✅ Note validation here
        if (isEmpty(formData.assignmentNote)) {
            e.assignmentNote = "Note is required.";
        } else if (formData.assignmentNote.length > MAX_NOTE_LENGTH) {
            e.assignmentNote = `Maximum ${MAX_NOTE_LENGTH} characters allowed.`;
        }

        setErrors(prev => ({ ...prev, ...e }));
        return Object.keys(e).length === 0;
    };

    const validateAssignTo = () => {
        const e = {};

        if (formData.assignTo === "Other" && isEmpty(customAssignToHandle)) {
            e.assignTo = "Please enter a name.";
        }

        setErrors(prev => ({ ...prev, ...e }));
        return Object.keys(e).length === 0;
    };

    // --------------------------------
    // TAB SWITCH VALIDATION
    // --------------------------------
    const handleNextTab = () => {
        if (key === "customer") {
            if (validateCustomerTab()) setKey("assignment");
        } else if (key === "assignment") {
            if (validateAssignmentTab()) setKey("assignto");
        }
    };

    const handleTabSelect = (selectedKey) => {
        if (selectedKey === "assignment" && !validateCustomerTab()) return;
        if (selectedKey === "assignto" && !validateAssignmentTab()) return;

        setKey(selectedKey);
    };

    // --------------------------------
    // SUBMIT HANDLER
    // --------------------------------
    const handleSubmit = async () => {
        if (!validateCustomerTab() || !validateAssignmentTab() || !validateAssignTo()) {
            return;
        }

        const dateTime = new Date(`${formData.assignmentDate}T${formData.assignmentTime}`);
        const token = JSON.parse(localStorage.getItem("camrilla_token"))?.accessToken;

        if (!token) return alert("Missing access token");

        const payload = {
            ...formData,
            assignmentName: showOtherInput ? customAssignmentName : formData.assignmentName,
            assignmentDateTime: dateTime.getTime(),
            assignToHandle: formData.assignTo === "Me" ? "MeTo" : customAssignToHandle,
        };

        try {
            const res = await axios.post(`${config.BASE_URL}order/assignment`, payload);
            if (res.data.code === 0) {
                incrementAssignmentCount();
                alert("Assignment created successfully");
                handleClose();
                refreshEvents(selectedDate);
            } else if (res.data.messageDesc === "Free Limit Exceeded") {
                handleClose();
                triggerBasicPlanModal();
            } else {
                alert("Failed: " + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
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
                assignmentNote: '',   // ✅ reset note
            });
            setErrors({});
            setCustomAssignToHandle('');
            setCustomAssignmentName('');
            setShowOtherInput(false);
            setKey('customer');
        }
    }, [show, preFilledDate]);

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Add Event</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Tabs activeKey={key} onSelect={handleTabSelect} className="mb-3">

                    {/* ---------------- CUSTOMER TAB ---------------- */}
                    <Tab eventKey="customer" title="Customer">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer Name</Form.Label>
                                <Form.Control
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleTextInputChange}
                                    isInvalid={!!errors.customerName}
                                />
                                <Form.Control.Feedback type="invalid">{errors.customerName}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleTextInputChange}
                                    isInvalid={!!errors.customerEmail}
                                />
                                <Form.Control.Feedback type="invalid">{errors.customerEmail}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mobile</Form.Label>
                                <Form.Control
                                    name="customerMobile"
                                    value={formData.customerMobile}
                                    onChange={handleTextInputChange}
                                    isInvalid={!!errors.customerMobile}
                                />
                                <Form.Control.Feedback type="invalid">{errors.customerMobile}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    name="customerAddress"
                                    value={formData.customerAddress}
                                    onChange={handleTextInputChange}
                                    isInvalid={!!errors.customerAddress}
                                />
                                <Form.Control.Feedback type="invalid">{errors.customerAddress}</Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Tab>

                    {/* ---------------- ASSIGNMENT TAB ---------------- */}
                    <Tab eventKey="assignment" title="Assignment">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Assignment</Form.Label>
                                <Form.Select
                                    onChange={handleAssignmentChange}
                                    defaultValue=""
                                    isInvalid={!!errors.assignmentName}
                                >
                                    <option disabled value="">-- Select Assignment --</option>
                                    {uniqueAssignmentNames.map((name, i) => (
                                        <option key={i} value={name}>{name}</option>
                                    ))}
                                    <option value="other">Other</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.assignmentName}</Form.Control.Feedback>
                            </Form.Group>

                            {showOtherInput && (
                                <Form.Group className="mb-3">
                                    <Form.Label>New Assignment Name</Form.Label>
                                    <Form.Control
                                        value={customAssignmentName}
                                        onChange={(e) => setCustomAssignmentName(e.target.value.trim())}
                                        isInvalid={!!errors.assignmentName}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.assignmentName}</Form.Control.Feedback>
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Venue</Form.Label>
                                <Form.Control
                                    name="assignmentAddress"
                                    value={formData.assignmentAddress}
                                    onChange={handleTextInputChange}
                                    isInvalid={!!errors.assignmentAddress}
                                />

                                <Form.Control.Feedback type="invalid">{errors.assignmentAddress}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Alternate Contact</Form.Label>
                                <Form.Control
                                    name="contactPerson1Mobile"
                                    value={formData.contactPerson1Mobile}
                                    onChange={handleTextInputChange}
                                    isInvalid={!!errors.contactPerson1Mobile}
                                />
                                <Form.Control.Feedback type="invalid">{errors.contactPerson1Mobile}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Control
                                type="date"
                                name="assignmentDate"
                                value={formData.assignmentDate}
                                onChange={handleInputChange}
                                min={minDate}
                                max={maxDate}
                                isInvalid={!!errors.assignmentDate}
                            />
                            <Form.Control.Feedback type="invalid">{errors.assignmentDate}</Form.Control.Feedback>

                            <Form.Group className="mt-3 mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="assignmentTime"
                                    value={formData.assignmentTime}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.assignmentTime}
                                />
                                <Form.Control.Feedback type="invalid">{errors.assignmentTime}</Form.Control.Feedback>
                            </Form.Group>

                            {/* ✅ NEW NOTE FIELD WITH COUNTER */}
                            <Form.Group className="mb-3">
                                <Form.Label>Note</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="assignmentNote"
                                    value={formData.assignmentNote}
                                    onChange={handleNoteChange}
                                    isInvalid={!!errors.assignmentNote}
                                    placeholder="Enter assignment note (max 300 characters)"
                                />
                                <div className="d-flex justify-content-between mt-1">
                                    <Form.Text
                                        className={
                                            formData.assignmentNote.length > MAX_NOTE_LENGTH
                                                ? "text-danger"
                                                : "text-muted"
                                        }
                                    >
                                        {formData.assignmentNote.length} / {MAX_NOTE_LENGTH} characters
                                    </Form.Text>

                                    {errors.assignmentNote && (
                                        <Form.Control.Feedback
                                            type="invalid"
                                            style={{ display: "block" }}
                                        >
                                            {errors.assignmentNote}
                                        </Form.Control.Feedback>
                                    )}
                                </div>
                            </Form.Group>
                        </Form>
                    </Tab>

                    {/* ---------------- ASSIGN TO TAB ---------------- */}
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
                                        onChange={(e) => setCustomAssignToHandle(e.target.value.replace(/^\s+/, ''))}
                                        isInvalid={!!errors.assignTo}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.assignTo}</Form.Control.Feedback>
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
                    <Button
                        variant="primary"
                        onClick={handleNextTab}
                    >
                        Next
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
