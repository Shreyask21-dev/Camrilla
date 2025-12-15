import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  ToastContainer,
  Toast,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Card,
} from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartTooltip,
  Legend,
} from "recharts";
import { FiDownload, FiEdit, FiTrash, FiPlusCircle } from "react-icons/fi";
import useUserStore from "../store/userStore";

const defaultCategories = [
  "Travel",
  "Material",
  "Labor",
  "Food",
  "Accommodation",
  "Other",
];
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#9F5FFF",
  "#FF6384",
  "#4CAF50",
];

export default function AddExpenseModal({
  show,
  handleClose,
  assignment,
  startDate,
  endDate,
}) {
  const { user } = useUserStore();

  // state
  const [allExpenses, setAllExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const chartRef = useRef(null);

  // toast
  const [toast, setToast] = useState({ show: false, message: "", variant: "" });
  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: "", variant: "" }), 3000);
  };

  // child form modal state (for Add / Edit)
  const [showFormModal, setShowFormModal] = useState(false);
  const [formRows, setFormRows] = useState([
    { description: "", amount: "", category: "", date: "" },
  ]);
  const [formNote, setFormNote] = useState("");
  const [formEditingItemId, setFormEditingItemId] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const formRef = useRef(null);

  // category management state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loadingCategory, setLoadingCategory] = useState(false);

  // load categories + saved expenses when parent modal opens
  useEffect(() => {
    if (!show) return;
    setLoadingInitial(true);
    const stored = localStorage.getItem("userData");
    let userId = user?.id;
    try {
      if (!userId && stored) userId = JSON.parse(stored).id;
    } catch (e) {}

    const promises = [];

    if (userId) {
      promises.push(
        fetch(`/api/expense/category?userId=${userId}`)
          .then((r) => r.json())
          .then((d) =>
            Array.isArray(d)
              ? setExpenseCategories(d)
              : setExpenseCategories([])
          )
          .catch(() => setExpenseCategories([]))
      );
    }

    if (assignment?.id) {
      promises.push(
        fetch(`/api/expense/by-assignment?id=${assignment.id}`)
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d.expenses))
              setAllExpenses(
                d.expenses.map((exp) => ({
                  ...exp,
                  items: d.items[exp.id] || [],
                }))
              );
            else setAllExpenses([]);
          })
          .catch(() => setAllExpenses([]))
      );
    }

    Promise.all(promises).finally(() => setLoadingInitial(false));
  }, [show, user, assignment]);

  // helpers
  const openAddModal = () => {
    setFormRows([{ description: "", amount: "", category: "", date: "" }]);
    setFormNote("");
    setFormEditingItemId(null);
    setShowFormModal(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const openEditModal = (item) => {
    setFormRows([
      {
        description: item.description || "",
        amount: item.amount || "",
        category: item.category || "",
        date: item.date ? item.date.split("T")[0] : "",
      },
    ]);
    setFormNote(item.note || "");
    setFormEditingItemId(item.id);
    setShowFormModal(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
    showToast("Loaded for edit — click Save to persist", "info");
  };

  const handleFormChange = (index, field, value) => {
    const clone = [...formRows];
    clone[index][field] = value;
    setFormRows(clone);
  };
  const handleAddRow = () =>
    setFormRows([
      ...formRows,
      { description: "", amount: "", category: "", date: "" },
    ]);
  const handleRemoveRow = (index) =>
    setFormRows(formRows.filter((_, i) => i !== index));

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      const res = await fetch(`/api/expense/item/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      // refresh
      const refreshed = await fetch(
        `/api/expense/by-assignment?id=${assignment.id}`
      );
      const data = await refreshed.json();
      setAllExpenses(
        Array.isArray(data.expenses)
          ? data.expenses.map((exp) => ({
              ...exp,
              items: data.items[exp.id] || [],
            }))
          : []
      );
      setChartKey((p) => p + 1);
      showToast("Deleted", "success");
    } catch (e) {
      console.error(e);
      showToast("Delete failed", "danger");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      if (!stored || !assignment?.id)
        return showToast("User/assignment missing", "danger");
      const res = await fetch("/api/expense/download-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: assignment.id }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Export failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(stored.name || "user").replace(/\s+/g, "_")}_${
        stored.id || 0
      }_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast("Excel downloaded", "success");
    } catch (e) {
      console.error(e);
      showToast("Download failed", "danger");
    }
  };

  const handleFormSave = async () => {
    const valid = formRows.every(
      (r) =>
        r.description?.trim() &&
        parseFloat(r.amount) > 0 &&
        r.category &&
        r.date
    );
    if (!valid)
      return showToast("Please fill all fields for every row.", "danger");

    setLoadingSave(true);
    try {
      const tokenData = JSON.parse(
        localStorage.getItem("camrilla_token") || "{}"
      );
      const accessToken = tokenData?.accessToken;
      const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = stored.id;

      if (!accessToken) throw new Error("Auth required");

      if (formEditingItemId) {
        const res = await fetch(`/api/expense/item/${formEditingItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formRows[0]),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Update failed");
        showToast("Expense updated", "success");
      } else {
        const total = formRows.reduce(
          (s, it) => s + (parseFloat(it.amount) || 0),
          0
        );
        const payload = {
          assignmentId: assignment.id,
          startDate: new Date(startDate).getTime(),
          endDate: new Date(endDate).getTime(),
          token: accessToken,
          expenseData: { note: formNote, userId, total, items: formRows },
        };
        const res = await fetch("/api/expense/from-camrilla", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Save failed");
        showToast("Expense saved", "success");
      }

      // refresh
      const refreshed = await fetch(
        `/api/expense/by-assignment?id=${assignment.id}`
      );
      const result = await refreshed.json();
      setAllExpenses(
        Array.isArray(result.expenses)
          ? result.expenses.map((exp) => ({
              ...exp,
              items: result.items[exp.id] || [],
            }))
          : []
      );
      setChartKey((p) => p + 1);

      // reset & close
      setFormRows([{ description: "", amount: "", category: "", date: "" }]);
      setFormNote("");
      setFormEditingItemId(null);
      setShowFormModal(false);
      setTimeout(
        () => chartRef.current?.scrollIntoView({ behavior: "smooth" }),
        300
      );
    } catch (e) {
      console.error(e);
      showToast(e.message || "Save failed", "danger");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoadingCategory(true);
    try {
      const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = stored.id;
      const res = await fetch("/api/expense/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), userId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to add category");
      setNewCategoryName("");
      const refreshed = await fetch(`/api/expense/category?userId=${userId}`);
      const cats = await refreshed.json();
      setExpenseCategories(Array.isArray(cats) ? cats : []);
      showToast("Category added", "success");
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to add category", "danger");
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (!window.confirm(`Delete category "${categoryName}"?`)) return;
    try {
      const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = stored.id;
      const res = await fetch(
        `/api/expense/category?name=${encodeURIComponent(
          categoryName
        )}&userId=${userId}`,
        {
          method: "DELETE",
        }
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to delete category");
      const refreshed = await fetch(`/api/expense/category?userId=${userId}`);
      const cats = await refreshed.json();
      setExpenseCategories(Array.isArray(cats) ? cats : []);
      showToast("Category deleted", "success");
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to delete category", "danger");
    }
  };

  // compute summary
  const savedItems = allExpenses.flatMap((exp) => exp.items || []);
  const categoryMap = savedItems.reduce((acc, curr) => {
    const cat = curr.category || "Uncategorized";
    const amt = parseFloat(curr.amount) || 0;
    acc[cat] = (acc[cat] || 0) + amt;
    return acc;
  }, {});
  const usedTotal = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  const assignmentBudget = assignment?.totalAmount || 0;
  const profit = assignmentBudget - usedTotal;
  if (profit > 0) categoryMap["Profit"] = profit;
  else if (profit < 0) categoryMap["Loss"] = Math.abs(profit);

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: parseFloat((value || 0).toFixed(2)),
  }));

  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          show={toast.show}
          onClose={() => setToast({ show: false, message: "", variant: "" })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
        <Modal.Header>
          <Modal.Title>Expense Manager</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loadingInitial ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
              <div className="mt-2">Loading expense data...</div>
            </div>
          ) : (
            <div className="row">
              {/* LEFT: list & actions */}
              <div className="col-md-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-0">Expenses</h5>
                    <small className="text-muted">
                      Manage project expenses
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={openAddModal}>
                      <FiPlusCircle /> Add
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={handleDownloadExcel}
                    >
                      <FiDownload /> Export
                    </Button>
                  </div>
                </div>

                {allExpenses.length > 0 ? (
                  <Card className="mb-3">
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: 40 }}>#</th>
                              <th>Description</th>
                              <th style={{ width: 120 }}>Amount</th>
                              <th style={{ width: 140 }}>Category</th>
                              <th style={{ width: 120 }}>Date</th>
                              <th style={{ width: 120 }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allExpenses
                              .flatMap((exp) =>
                                exp.items.map((it) => ({
                                  ...it,
                                  note: exp.note || "-",
                                }))
                              )
                              .map((item, i) => (
                                <tr key={item.id || i}>
                                  <td>{i + 1}</td>
                                  <td title={item.description}>
                                    {item.description}
                                  </td>
                                  <td>₹{parseFloat(item.amount).toFixed(2)}</td>
                                  <td>{item.category}</td>
                                  <td>
                                    {item.date
                                      ? new Date(item.date).toLocaleDateString()
                                      : "-"}
                                  </td>
                                  <td className="d-flex gap-2">
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Edit</Tooltip>}
                                    >
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => openEditModal(item)}
                                      >
                                        <FiEdit />
                                      </Button>
                                    </OverlayTrigger>

                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Delete</Tooltip>}
                                    >
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteItem(item.id)
                                        }
                                      >
                                        <FiTrash />
                                      </Button>
                                    </OverlayTrigger>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <div className="text-center py-4">
                    <div className="mb-2">No expenses yet</div>
                    <div className="text-muted">
                      Click Add to create your first expense.
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div className="mt-3">
                  <h6 className="mb-2">Categories</h6>
                  <Row className="g-2 align-items-center mb-2">
                    <Col xs={8}>
                      <Form.Control
                        type="text"
                        placeholder="New category"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </Col>
                    <Col xs={4}>
                      <Button
                        variant="primary"
                        onClick={handleAddCategory}
                        disabled={loadingCategory || !newCategoryName.trim()}
                      >
                        {loadingCategory ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </Col>
                  </Row>

                  <div>
                    {(expenseCategories.length
                      ? expenseCategories
                      : defaultCategories
                    ).map((cat, i) => (
                      <div key={i} className="d-inline-block me-2 mb-2">
                        <span className="badge bg-light text-dark me-1">
                          {cat}
                        </span>
                        <button
                          className="btn btn-sm btn-link p-0"
                          onClick={() => handleDeleteCategory(cat)}
                          aria-label={`Delete ${cat}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: pie chart + summary (styling focused) */}
              <div className="col-md-4" ref={chartRef}>
                <Card className="mb-3">
                  <Card.Body>
                    <h6 className="mb-3">Summary</h6>
                    <div className="mb-2 d-flex justify-content-between">
                      <div className="text-muted">Budget</div>
                      <div className="fw-semibold">
                        ₹{assignment?.totalAmount?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <div className="mb-2 d-flex justify-content-between">
                      <div className="text-muted">Total Expenses</div>
                      <div className="fw-semibold">₹{usedTotal.toFixed(2)}</div>
                    </div>
                    <div className="mb-2 d-flex justify-content-between">
                      <div className="text-muted">
                        {profit >= 0 ? "Profit" : "Loss"}
                      </div>
                      <div
                        className={`fw-semibold ${
                          profit >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        ₹{profit.toFixed(2)}
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Body className="text-center">
                    <h6 className="mb-3">Expense Breakdown</h6>
                    {pieData.length > 0 ? (
                      <div>
                        <PieChart width={260} height={260} key={chartKey}>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            animationDuration={800}
                          >
                            {pieData.map((entry, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={COLORS[idx % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartTooltip
                            formatter={(value) => [
                              `₹${parseFloat(value).toFixed(2)}`,
                              "Amount",
                            ]}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>

                        <div className="mt-2 text-start">
                          {pieData.slice(0, 8).map((d, i) => (
                            <div
                              key={i}
                              className="d-flex justify-content-between small py-1"
                            >
                              <div>
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: 12,
                                    height: 12,
                                    background: COLORS[i % COLORS.length],
                                    borderRadius: 6,
                                    marginRight: 8,
                                  }}
                                ></span>
                                {d.name}
                              </div>
                              <div>₹{parseFloat(d.value).toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted">No data to display</div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Child modal: Add / Edit form */}
      <Modal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        size="lg"
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title>
            {formEditingItemId ? "Edit Expense Item" : "Add Expense Items"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form ref={formRef}>
            {formRows.map((row, idx) => (
              <div key={idx} className="mb-3 p-2 border rounded">
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Description"
                      value={row.description}
                      onChange={(e) =>
                        handleFormChange(idx, "description", e.target.value)
                      }
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="number"
                      placeholder="Amount"
                      value={row.amount}
                      onChange={(e) =>
                        handleFormChange(idx, "amount", e.target.value)
                      }
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={row.category}
                      onChange={(e) =>
                        handleFormChange(idx, "category", e.target.value)
                      }
                    >
                      <option value="">Category</option>
                      {(expenseCategories.length
                        ? expenseCategories
                        : defaultCategories
                      ).map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={1} className="text-end">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveRow(idx)}
                      disabled={formRows.length === 1}
                    >
                      ×
                    </Button>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col>
                    <Form.Control
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        handleFormChange(idx, "date", e.target.value)
                      }
                    />
                  </Col>
                </Row>
              </div>
            ))}

            <div className="mb-3">
              <Button variant="outline-primary" onClick={() => handleAddRow()}>
                Add another
              </Button>
            </div>

            <div className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Note (optional)"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFormModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleFormSave}
            disabled={loadingSave}
          >
            {loadingSave ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
