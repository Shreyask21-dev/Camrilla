'use client'
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'

export default function Page() {

    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [assignmentForm, setAssignmentForm] = useState({
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
    const [assignmentTab, setAssignmentTab] = useState('customer');
    const [customAssignmentName, setCustomAssignmentName] = useState('');
    const [showOtherAssignmentInput, setShowOtherAssignmentInput] = useState(false);


    const openAssignmentModal = (lead) => {
        setAssignmentForm({
            customerName: lead.customerName || '',
            customerMobile: lead.customerMobile || '',
            customerEmail: lead.customerEmail || '',
            customerAddress: lead.customerAddress || '',
            assignmentName: lead.assignmentType || '',
            assignmentAddress: '',
            contactPerson1Mobile: '',
            assignmentDate: '',
            assignmentTime: '',
            assignTo: 'Me',
            assignToName: 'Me',
            assignToHandle: 'MeTo',
        });
        setAssignmentTab('customer');
        setShowOtherAssignmentInput(false);
        setCustomAssignmentName('');
        setShowAssignmentModal(true);
    };


    const [selectedLead, setSelectedLead] = useState(null);
    const [isOtherSelectedEdit, setIsOtherSelectedEdit] = useState(false);

    const openEditLeadModal = (lead) => {
        setSelectedLead({
            ...lead,
            assignmentDateTime: new Date(lead.assignmentDateTime).toISOString().slice(0, 16) // convert timestamp to input value
        });

        setIsOtherSelectedEdit(false); // reset Other handling

        const modalElement = document.getElementById('editLeadModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    };


    const [selectedTypes, setSelectedTypes] = useState(['all']);

    const [isOtherSelected, setIsOtherSelected] = useState(false);

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newLead, setNewLead] = useState({
        customerName: '',
        customerMobile: '',
        customerEmail: '',
        customerAddress: '',
        assignmentDateTime: '',
        totalAmount: '',
        assignmentType: '',
    });

    const handleDateTimeChange = (dateString) => {
        const timestamp = new Date(dateString).getTime();
        setNewLead({ ...newLead, assignmentDateTime: timestamp });
    };

    const handleEditLead = (e) => {
        e.preventDefault();

        const camrillaToken = localStorage.getItem('camrilla_token');
        if (!camrillaToken) {
            console.error('No token found');
            return;
        }

        const { accessToken } = JSON.parse(camrillaToken);

        const body = {
            ...selectedLead,
            assignmentDateTime: new Date(selectedLead.assignmentDateTime).getTime(), // back to timestamp
        };

        axios.put(`http://api.camrilla.com/lead-manager/lead/${selectedLead.id}`, body, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                console.log('Lead Updated:', response.data);
                // Close Modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editLeadModal'));
                modal.hide();
                // Clear selected
                setSelectedLead(null);
                // Refresh leads
                fetchLeads();
            })
            .catch(error => {
                console.error('Failed to update lead:', error);
            });
    };


    const handleAddLead = (e) => {
        e.preventDefault();

        const camrillaToken = localStorage.getItem('camrilla_token');
        if (!camrillaToken) {
            console.error('No token found');
            return;
        }

        const { accessToken } = JSON.parse(camrillaToken);

        axios.post('http://api.camrilla.com/lead-manager/lead', newLead, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                console.log('Lead Added:', response.data);
                // Close Modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addLeadModal'));
                modal.hide();
                // Clear form
                setNewLead({
                    customerName: '',
                    customerMobile: '',
                    customerEmail: '',
                    customerAddress: '',
                    assignmentDateTime: '',
                    totalAmount: '',
                });
                // Refresh leads
                fetchLeads();
            })
            .catch(error => {
                console.error('Failed to add lead:', error);
            });
    };




    const fetchLeads = () => {
        const camrillaToken = localStorage.getItem('camrilla_token');
        if (!camrillaToken) {
            console.error('No token found');
            return;
        }

        const { accessToken } = JSON.parse(camrillaToken);

        axios.get('http://api.camrilla.com/lead-manager/lead', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => {
                setLeads(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed fetching leads:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const openAddLeadModal = () => {
        const modalElement = document.getElementById('addLeadModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    };

    const handleSelectAll = () => {
        if (selectedTypes.includes('all')) {
            setSelectedTypes([]); // unselect all
        } else {
            setSelectedTypes(['all']); // select all
        }
    };

    const handleTypeChange = (type) => {
        if (selectedTypes.includes('all')) {
            setSelectedTypes([type]);
        } else {
            if (selectedTypes.includes(type)) {
                const updated = selectedTypes.filter(item => item !== type);
                setSelectedTypes(updated.length === 0 ? ['all'] : updated);
            } else {
                setSelectedTypes([...selectedTypes, type]);
            }
        }
    };

    const uniqueAssignmentTypes = useMemo(() => {
        return [...new Set(leads.map(lead => lead.assignmentType))];
    }, [leads]);


    const handleNextAssignmentTab = () => {
        if (assignmentTab === 'customer') setAssignmentTab('assignment');
        else if (assignmentTab === 'assignment') setAssignmentTab('assignto');
    };

    const handleSubmitAssignment = async () => {
        const accessToken = JSON.parse(localStorage.getItem('camrilla_token'))?.accessToken;
        if (!accessToken) return alert('Missing token');

        const dateTime = new Date(`${assignmentForm.assignmentDate}T${assignmentForm.assignmentTime}`);

        const payload = {
            customerName: assignmentForm.customerName,
            customerMobile: assignmentForm.customerMobile,
            customerEmail: assignmentForm.customerEmail,
            customerAddress: assignmentForm.customerAddress,
            assignmentAddress: assignmentForm.assignmentAddress,
            assignmentName: showOtherAssignmentInput ? customAssignmentName : assignmentForm.assignmentName,
            assignmentDateTime: dateTime.getTime(),
            assignmentStatus: "Completed",
            contactPerson1Name: "",
            contactPerson1Mobile: assignmentForm.contactPerson1Mobile,
            contactPerson2Name: "",
            contactPerson2Mobile: "",
            assignToName: assignmentForm.assignToName,
            assignToHandle: assignmentForm.assignToHandle,
            assignmentNote: "Some Note",
            totalAmount: 0,
            reminderBeforedays: 1,
            reminderDate: "21-11-2018"
        };

        try {
            const res = await axios.post('http://api.camrilla.com/order/assignment', payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.data.code === 0) {
                alert('Assignment Created Successfully');
                setShowAssignmentModal(false);
            } else {
                alert('Failed: ' + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        }
    };

    const handleDeleteLead = async () => {
        if (!selectedLead) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this lead?");
        if (!confirmDelete) return;

        const camrillaToken = localStorage.getItem('camrilla_token');
        if (!camrillaToken) {
            console.error('No token found');
            return;
        }

        const { accessToken } = JSON.parse(camrillaToken);

        try {
            const response = await axios.delete(`http://api.camrilla.com/lead-manager/lead/${selectedLead.id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });

            console.log('Lead deleted:', response.data);

            // Close modal after delete
            const modal = bootstrap.Modal.getInstance(document.getElementById('editLeadModal'));
            modal.hide();
            setSelectedLead(null);

            // Refresh leads list
            fetchLeads();

        } catch (error) {
            console.error('Failed to delete lead:', error);
            alert('Failed to delete lead');
        }
    };





    return (
        <div>
            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="card app-calendar-wrapper">
                    <div className="row g-0">

                        <div className="col app-calendar-sidebar border-end" id="app-calendar-sidebar">

                            <div className="p-5 my-sm-0 mb-4 border-bottom">

                                <button
                                    className="btn btn-primary btn-toggle-sidebar w-100"
                                    onClick={openAddLeadModal}>
                                    <i className="ri-add-line ri-16px me-1_5"></i>
                                    <span className="align-middle">Add Leads</span>
                                </button>
                            </div>
                            <div className="px-4">

                                <div style={{ display: "flex", justifyContent: "center" }}>

                                    <div style={{ transform: "scale(1.2)", transformOrigin: "top center", marginBottom: "20%", margintop: "10%" }}>
                                        <DatePicker
                                            inline
                                        />

                                    </div>

                                </div>

                                <hr className="mb-5 mx-n4 mt-3" />

                                <div className="mb-4 ms-1">
                                    <h5>Event Filters</h5>
                                </div>

                                {/* View All */}
                                <div className="form-check form-check-secondary mb-5 ms-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="viewAll"
                                        checked={selectedTypes.includes('all')}
                                        onChange={() => handleSelectAll()}
                                    />
                                    <label className="form-check-label" htmlFor="viewAll">View All</label>
                                </div>

                                {/* Dynamic Assignment Types */}
                                <div className="app-calendar-events-filter text-heading">
                                    {uniqueAssignmentTypes.map((type, index) => (
                                        <div className="form-check mb-4 ms-3" key={index}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`filter-${type}`}
                                                checked={selectedTypes.includes(type)}
                                                onChange={() => handleTypeChange(type)}
                                            />
                                            <label className="form-check-label" htmlFor={`filter-${type}`}>
                                                {type}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col app-calendar-content">
                            <div className="card shadow-none border-0">


                                <div class="card-header d-flex align-items-center justify-content-between border border-top-0 border-start-0 border-end-0">
                                    <h5 class="card-title m-0 me-2  py-1">Leads Captured</h5>
                                    <div class="dropdown">
                                        <button
                                            class="btn btn-text-secondary rounded-pill text-muted border-0 p-1"
                                            type="button"
                                            id="meetingSchedule"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false">
                                            <i class="ri-more-2-line ri-20px"></i>
                                        </button>
                                        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="meetingSchedule">
                                            <a class="dropdown-item" href="javascript:void(0);">Last 28 Days</a>
                                            <a class="dropdown-item" href="javascript:void(0);">Last Month</a>
                                            <a class="dropdown-item" href="javascript:void(0);">Last Year</a>
                                        </div>
                                    </div>
                                </div>


                                <div className="card-body mt-4">
                                    {loading ? (
                                        <p>Loading leads...</p>
                                    ) : (
                                        <div className="d-flex flex-column gap-4">
                                            {leads.filter((lead) => {
                                                if (selectedTypes.includes('all')) return true;
                                                return selectedTypes.includes(lead.assignmentType);
                                            })
                                                .map((lead) => {
                                                    const assignmentDate = new Date(lead.assignmentDateTime);
                                                    const leadCreatedDate = new Date(lead.leadDate);

                                                    const day = assignmentDate.getDate();
                                                    const month = assignmentDate.toLocaleString('default', { month: 'short' });
                                                    const year = assignmentDate.getFullYear();

                                                    return (
                                                        <div key={lead.id} className="d-flex align-items-center justify-content-between flex-nowrap border-bottom pb-3">

                                                            {/* Date */}
                                                            <div className="text-center" style={{ minWidth: '60px' }}>
                                                                <small className="text-muted">{month}</small>
                                                                <h3 className="mb-0">{day}</h3>
                                                                <small className="text-muted">{year}</small>
                                                            </div>

                                                            {/* Name | Phone | Email in one line */}
                                                            <div className="d-flex align-items-center gap-1" style={{ minWidth: '180px' }}>
                                                                <strong>{lead.customerName}</strong>
                                                                <span className="text-muted">|</span>
                                                                <strong>{lead.customerMobile}</strong>
                                                                <span className="text-muted">|</span>
                                                                <strong>{lead.customerEmail}</strong>
                                                            </div>

                                                            {/* Assignment Type */}
                                                            <div style={{ minWidth: '80px' }}>
                                                                <strong>{lead.assignmentType}</strong>
                                                            </div>

                                                            {/* Total Amount */}
                                                            <div style={{ minWidth: '70px' }}>
                                                                <strong>₹{lead.totalAmount}</strong>
                                                            </div>

                                                            {/* Lead Date */}
                                                            <div style={{ minWidth: '100px' }}>
                                                                <strong>{leadCreatedDate.toLocaleDateString()}</strong>
                                                            </div>

                                                            <div className='text-center my-2'>
                                                                <span className={`badge rounded-pill ${lead.status === 'IN-PROGRESS' ? 'bg-label-info' :
                                                                    lead.status === 'CONVERTED' ? 'bg-label-success' :
                                                                        lead.status === 'NEW' ? 'bg-label-primary' :
                                                                            'bg-label-secondary'
                                                                    }`}>
                                                                    {lead.status}
                                                                </span>
                                                            </div>

                                                            {/* Status Badge */}
                                                            <div className='d-flex flex-wrap justify-content-center align-items-center gap-2'>

                                                                {lead.status === 'CONVERTED' && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-warning"
                                                                        onClick={() => openAssignmentModal(lead)}
                                                                    >
                                                                        <i className="bi bi-plus-lg"></i> {/* Bootstrap Plus Icon */}
                                                                    </button>
                                                                )}

                                                                <button
                                                                    className="btn btn-sm btn-outline-dark"
                                                                    onClick={() => openEditLeadModal(lead)}
                                                                >
                                                                    <i className="ri-pencil-line"></i> {/* Remixicon Pencil */}
                                                                </button>

                                                            </div>


                                                        </div>

                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>


                            </div>

                        </div>

                    </div>
                </div>
            </div>

            {/* Add Lead Modal */}
            <div className="modal fade" id="addLeadModal" tabIndex="-1" aria-labelledby="addLeadModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addLeadModalLabel">Add New Lead</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {/* Form inside Modal */}
                            <form onSubmit={handleAddLead}>
                                <div className="mb-3">
                                    <label className="form-label">Customer Name</label>
                                    <input type="text" className="form-control" value={newLead.customerName} onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Customer Mobile</label>
                                    <input type="text" className="form-control" value={newLead.customerMobile} onChange={(e) => setNewLead({ ...newLead, customerMobile: e.target.value })} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Customer Email</label>
                                    <input type="email" className="form-control" value={newLead.customerEmail} onChange={(e) => setNewLead({ ...newLead, customerEmail: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Customer Address</label>
                                    <input type="text" className="form-control" value={newLead.customerAddress} onChange={(e) => setNewLead({ ...newLead, customerAddress: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Assignment Type</label>
                                    <select
                                        className="form-select"
                                        value={newLead.assignmentType}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === 'Other') {
                                                setIsOtherSelected(true);
                                                setNewLead({ ...newLead, assignmentType: '' }); // Clear assignmentType to allow typing
                                            } else {
                                                setIsOtherSelected(false);
                                                setNewLead({ ...newLead, assignmentType: value });
                                            }
                                        }}
                                        required={!isOtherSelected}
                                    >
                                        <option value="">Select Type</option>
                                        {uniqueAssignmentTypes.map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {isOtherSelected && (
                                    <div className="mb-3 mt-2">
                                        <label className="form-label">Enter New Assignment Type</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newLead.assignmentType}
                                            onChange={(e) => setNewLead({ ...newLead, assignmentType: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}


                                <div className="mb-3">
                                    <label className="form-label">Assignment DateTime</label>
                                    <input type="datetime-local" className="form-control" onChange={(e) => handleDateTimeChange(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Total Amount</label>
                                    <input type="number" className="form-control" value={newLead.totalAmount} onChange={(e) => setNewLead({ ...newLead, totalAmount: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="editLeadModal" tabIndex="-1" aria-labelledby="editLeadModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header d-flex justify-content-between align-items-center">
                            <h5 className="modal-title" id="editLeadModalLabel">Edit Lead</h5>
                            <div className="d-flex align-items-center gap-2">
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDeleteLead}>
                                    <i className="ri-delete-bin-6-line"></i> {/* Remixicon trash bin icon */}
                                </button>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                        </div>
                        <div className="modal-body">
                            {selectedLead && (
                                <form onSubmit={handleEditLead}>
                                    {/* Same fields like Add Lead, but with selectedLead */}
                                    {/* customerName */}
                                    <div className="mb-3">
                                        <label className="form-label">Customer Name</label>
                                        <input type="text" className="form-control" value={selectedLead.customerName} onChange={(e) => setSelectedLead({ ...selectedLead, customerName: e.target.value })} required />
                                    </div>

                                    {/* customerMobile */}
                                    <div className="mb-3">
                                        <label className="form-label">Customer Mobile</label>
                                        <input type="text" className="form-control" value={selectedLead.customerMobile} onChange={(e) => setSelectedLead({ ...selectedLead, customerMobile: e.target.value })} required />
                                    </div>

                                    {/* customerEmail */}
                                    <div className="mb-3">
                                        <label className="form-label">Customer Email</label>
                                        <input type="email" className="form-control" value={selectedLead.customerEmail} onChange={(e) => setSelectedLead({ ...selectedLead, customerEmail: e.target.value })} />
                                    </div>

                                    {/* customerAddress */}
                                    <div className="mb-3">
                                        <label className="form-label">Customer Address</label>
                                        <input type="text" className="form-control" value={selectedLead.customerAddress} onChange={(e) => setSelectedLead({ ...selectedLead, customerAddress: e.target.value })} />
                                    </div>

                                    {/* Assignment Type Dropdown */}
                                    <div className="mb-3">
                                        <label className="form-label">Assignment Type</label>
                                        <select
                                            className="form-select"
                                            value={selectedLead.assignmentType}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === 'Other') {
                                                    setIsOtherSelectedEdit(true);
                                                    setSelectedLead({ ...selectedLead, assignmentType: '' });
                                                } else {
                                                    setIsOtherSelectedEdit(false);
                                                    setSelectedLead({ ...selectedLead, assignmentType: value });
                                                }
                                            }}
                                            required={!isOtherSelectedEdit}
                                        >
                                            <option value="">Select Type</option>
                                            {uniqueAssignmentTypes.map((type, index) => (
                                                <option key={index} value={type}>{type}</option>
                                            ))}
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* If Other is selected */}
                                    {isOtherSelectedEdit && (
                                        <div className="mb-3 mt-2">
                                            <label className="form-label">Enter New Assignment Type</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedLead.assignmentType}
                                                onChange={(e) => setSelectedLead({ ...selectedLead, assignmentType: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}

                                    {/* Assignment DateTime */}
                                    <div className="mb-3">
                                        <label className="form-label">Assignment DateTime</label>
                                        <input type="datetime-local" className="form-control" value={selectedLead.assignmentDateTime} onChange={(e) => setSelectedLead({ ...selectedLead, assignmentDateTime: e.target.value })} required />
                                    </div>

                                    {/* Total Amount */}
                                    <div className="mb-3">
                                        <label className="form-label">Total Amount</label>
                                        <input type="number" className="form-control" value={selectedLead.totalAmount} onChange={(e) => setSelectedLead({ ...selectedLead, totalAmount: e.target.value })} />
                                    </div>

                                    {/* Status Dropdown */}
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={selectedLead.status}
                                            onChange={(e) => setSelectedLead({ ...selectedLead, status: e.target.value })}
                                            required
                                        >
                                            <option value="NEW">New</option>
                                            <option value="IN-PROGRESS">In Progress</option>
                                            <option value="CONVERTED">Converted</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>

                                    {/* Submit */}
                                    <button type="submit" className="btn btn-primary w-100">Update Lead</button>

                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`modal fade ${showAssignmentModal ? 'show d-block' : ''}`} tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Add Assignment</h5>
                            <button type="button" className="btn-close" onClick={() => setShowAssignmentModal(false)}></button>
                        </div>
                        <div className="modal-body">

                            {/* Tab Buttons */}
                            <ul className="nav nav-tabs mb-3">
                                <li className="nav-item">
                                    <button className={`nav-link ${assignmentTab === 'customer' ? 'active' : ''}`} onClick={() => setAssignmentTab('customer')}>Customer</button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link ${assignmentTab === 'assignment' ? 'active' : ''}`} onClick={() => setAssignmentTab('assignment')}>Assignment</button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link ${assignmentTab === 'assignto' ? 'active' : ''}`} onClick={() => setAssignmentTab('assignto')}>Assign To</button>
                                </li>
                            </ul>

                            {/* Tab Content */}
                            {assignmentTab === 'customer' && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Customer Name</label>
                                        <input className="form-control" value={assignmentForm.customerName} onChange={(e) => setAssignmentForm({ ...assignmentForm, customerName: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Customer Email</label>
                                        <input className="form-control" value={assignmentForm.customerEmail} onChange={(e) => setAssignmentForm({ ...assignmentForm, customerEmail: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Customer Mobile</label>
                                        <input className="form-control" value={assignmentForm.customerMobile} onChange={(e) => setAssignmentForm({ ...assignmentForm, customerMobile: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Customer Address</label>
                                        <input className="form-control" value={assignmentForm.customerAddress} onChange={(e) => setAssignmentForm({ ...assignmentForm, customerAddress: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {assignmentTab === 'assignment' && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Assignment Name</label>
                                        <input
                                            className="form-control"
                                            value={assignmentForm.assignmentName}
                                            onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentName: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Assignment Address</label>
                                        <input className="form-control" value={assignmentForm.assignmentAddress} onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentAddress: e.target.value })} />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Alternate Mobile</label>
                                        <input className="form-control" value={assignmentForm.contactPerson1Mobile} onChange={(e) => setAssignmentForm({ ...assignmentForm, contactPerson1Mobile: e.target.value })} />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Assignment Date</label>
                                        <input type="date" className="form-control" value={assignmentForm.assignmentDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentDate: e.target.value })} />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Assignment Time</label>
                                        <input type="time" className="form-control" value={assignmentForm.assignmentTime} onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentTime: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {assignmentTab === 'assignto' && (
                                <>
                                    <div className="form-check">
                                        <input type="radio" className="form-check-input" id="me" name="assignTo" value="Me" checked={assignmentForm.assignTo === 'Me'} onChange={(e) => setAssignmentForm({ ...assignmentForm, assignTo: e.target.value, assignToName: 'Me', assignToHandle: 'MeTo' })} />
                                        <label className="form-check-label" htmlFor="me">Me</label>
                                    </div>
                                    <div className="form-check">
                                        <input type="radio" className="form-check-input" id="other" name="assignTo" value="Other" checked={assignmentForm.assignTo === 'Other'} onChange={(e) => setAssignmentForm({ ...assignmentForm, assignTo: e.target.value, assignToName: 'Other', assignToHandle: 'OtherTo' })} />
                                        <label className="form-check-label" htmlFor="other">Other</label>
                                    </div>
                                </>
                            )}

                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                            {assignmentTab === 'assignto' ? (
                                <button className="btn btn-primary" onClick={handleSubmitAssignment}>Submit</button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleNextAssignmentTab}>Next</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>




        </div>
    )
}
