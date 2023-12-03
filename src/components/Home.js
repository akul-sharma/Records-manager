import React, { useState, useEffect } from "react";
import { Table, Button, Form, InputGroup, FormControl, Pagination, Navbar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-free/css/all.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Home.css';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import createUtilityClassName from "react-bootstrap/esm/createUtilityClasses";
import { getDefaultNormalizer } from "@testing-library/react";

const Home = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedData, setDisplayedData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

  const apiUrl = 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';

  const fetchData = async () => {
    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      setData(result);
      updateTotalPages(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateTotalPages = (result) => {
    setTotalPages(Math.ceil(result.length / pageSize));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = data.filter((row) =>
      Object.values(row).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setDisplayedData(filteredData);
    updateTotalPages(filteredData);
  }, [searchQuery, data, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (id, field, value) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  
  };

  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((rowId) => rowId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleSelectAll = () => {
    const allRowIds = data.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row) => row.id);
    setSelectedRows((prevSelected) => (prevSelected.length === allRowIds.length ? [] : allRowIds));
  };

  const handleDeleteSelected = () => {
    setData((prevData) => prevData.filter((row) => !selectedRows.includes(row.id)));
    setSelectedRows([]);
  };

  const handleEditAction = (id) => {
    setEditingRowId(id);
  };

  const handleSaveEdit = (id) => {
    setEditingRowId(null);
    // Save Changes logic if needed
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    // Reset any changes made during editing if needed
  };

  const handleDeleteAction = (id,name) => {
    const confirmation = window.confirm(`Are you sure you want to delete the row with name ${name}?`);
    
    if (confirmation) {
      setData((prevData) => prevData.filter((row) => row.id !== id));
      setSelectedRows((prevSelected) => prevSelected.filter((rowId) => rowId !== id));
      console.log(`Deleted row with ID ${id}`);
    }
  };

  const renderTableRows = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return displayedData.slice(startIndex, endIndex).map((row) => (
      <tr key={row.id} className={selectedRows.includes(row.id) ? 'selected-row' : ''}>
        <td>
          <Form.Check
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={() => handleCheckboxChange(row.id)}
          />
        </td>
        <td>
          {editingRowId === row.id ? (
            <Form.Control
              type="text"
              value={row.name}
              onChange={(e) => handleEdit(row.id, 'name', e.target.value)}
            />
          ) : (
            row.name
          )}
        </td>
        <td>
          {editingRowId === row.id ? (
            <Form.Control
              type="text"
              value={row.email}
              onChange={(e) => handleEdit(row.id, 'email', e.target.value)}
            />
          ) : (
            row.email
          )}
        </td>
        <td>
          {editingRowId === row.id ? (
            <Form.Control
              type="text"
              value={row.role}
              onChange={(e) => handleEdit(row.id, 'role', e.target.value)}
            />
          ) : (
            row.role
          )}
        </td>
        <td>
          {editingRowId === row.id && (
            <>
              {/* Save button */}
              <Button
                variant="success"
                className="save mx-2"
                onClick={() => handleSaveEdit(row.id)}
              >
                Save
              </Button>

              {/* Cancel button */}
              <Button
                variant="secondary"
                className="cancel mx-2"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </>
          )}

          {editingRowId !== row.id && (
            <>
              {/* Edit button */}
              <Button
                variant="info"
                className="edit mx-2"
                onClick={() => handleEditAction(row.id)}
              >
                Edit
              </Button>


              {/* Delete button */}
              <Button
                variant="danger"
                className="delete mx-2"
                onClick={() => handleDeleteAction(row.id, row.name)}
              >
                Delete
              </Button>
            </>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <>

      <Navbar bg="dark" data-bs-theme="dark" className="header container-fluid mb-3">
          <h4 className="ms-3">HireQuotient</h4>
      </Navbar>

      <div className="container-fluid">

      <div className="d-flex justify-content-between mb-3 flex-wrap">
        <div className="mb-2" style={{ width: '85%' }}>
          <InputGroup>
            <FormControl
              placeholder="Search..."
              aria-label="Search"
              aria-describedby="basic-addon2"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </div>
        <div className="mb-2">
          <Button variant="danger" className="bulk-delete" onClick={handleDeleteSelected}>
            <FontAwesomeIcon style={{ color: 'white' }} icon={faTrash} />
          </Button>
        </div>
      </div>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                checked={selectedRows.length === pageSize}
                onChange={handleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </Table>

      <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
        <div className="mb-2 info">
          Selected {selectedRows.length} of {data.length}
        </div>
        
        <div className="mb-2 d-flex align-items-center">
          <div className="mb-2 me-3 info">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination>
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

            {Array.from({ length: totalPages }).map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={currentPage === index + 1}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      </div>
    </div>

      
    </>
  );
};

export default Home;
