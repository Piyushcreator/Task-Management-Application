import React, { useState, useEffect, useRef } from 'react'
import Data from '../components/Data';

const Home = () => {
  const initialState = {
    taskId: 0,
    title: "",
    description: "",
    dueDate: "",
    priority: 0,
    status: "Incomplete"
  }

  const [task, settask] = useState(initialState);
  const [taskData, settaskData] = useState(Data);

  const [modalTitle, setModalTitle] = useState("");

  const [priorityFilter, setpriorityFilter] = useState("All");
  const [statusFilter, setstatusFilter] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newTaskCreation, setnewTaskCreation] = useState(false);

  const modalRef = useRef(null);

  const recordsPerPage = 10;

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  }

  const createTask = () => {
    const nextTaskId = getNextTaskId();
    settask((prev) => ({ ...prev, taskId: nextTaskId }));
    settaskData([...taskData, { ...task, taskId: nextTaskId }]);
    setnewTaskCreation(true);
    if (modalRef.current) {
      modalRef.current.click();
    }
    //window.location.reload();

  }


  const updateTask = () => {
    const updatedTasks = taskData.map((item) =>
      item.taskId === task.taskId ? { ...item, ...task } : item
    );
    settaskData([...updatedTasks]);
    updateLocalStorage([...updatedTasks]);
    setpriorityFilter("All");
    setstatusFilter("All");
    if (modalRef.current) {
      modalRef.current.click();
    }
    //window.location.reload();

  };

  const deleteTask = (taskId) => {
    const updatedTasks = taskData.filter((item) => item.taskId !== taskId);
    settaskData(updatedTasks);
    updateLocalStorage(updatedTasks);
  };


  const editModal = (item) => {
    const newState = { ...item };
    settask(newState)
    setModalTitle("Update Task");
  }


  const getNextTaskId = () => {
    const maxId = taskData.reduce((max, task) => (task.taskId > max ? task.taskId : max), 1);
    return maxId + 1;
  };


  const createModal = () => {
    settask(initialState);
    setModalTitle("Add Task");
  }

  const handleChange = (event) => {
    settask(prev => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handlePriorityFilterChange = (event) => {
    event.preventDefault()
    setpriorityFilter(event.target.value);

  }

  const handleStatusFilterChange = (event) => {
    event.preventDefault()

    setstatusFilter(event.target.value);


    // Use the updated state values in the console.log

  }


  const updateLocalStorage = (updatedTasks) => {
    localStorage.setItem('tasksdata', JSON.stringify(updatedTasks));
  }

  // Function to initialize tasks from local storage
  const initializeTasksFromLocalStorage = () => {
    const data = localStorage.getItem('tasksdata')
    if (data) {
      const storedTasks = JSON.parse(data);
      if (storedTasks.length > 0) {
        settaskData(storedTasks);
      }
    }
  }

  const filterTasks = (priority, status, searchTerm, getUpcomingtasks) => {
    const currentDate = new Date();

    const filteredTasks = taskData.filter((item) => {
      let isUpcoming = true;
      if (getUpcomingtasks) {
        isUpcoming = item.dueDate && new Date(item.dueDate) > currentDate;
      }
      const searchTermMatch = item.title.toLowerCase().startsWith(searchTerm.toLowerCase());
      return (
        (priority === 'All' || item.priority === priority) &&
        (status === 'All' || item.status === status) &&
        (searchTerm === '' || searchTermMatch) &&
        isUpcoming
      );
    });
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;

    return filteredTasks.slice(startIndex, endIndex);
  };


  const compareDueDates = (task1, task2) => {
    const date1 = new Date(task1.dueDate);
    const date2 = new Date(task2.dueDate);

    if (date1 < date2) {
      return -1;
    } else if (date1 > date2) {
      return 1;
    } else {
      return 0;
    }
  }

  const getOverdueTasks = () => {
    const currentDate = new Date();
    const overdueTasks = taskData.filter((item) => {
      if (item.dueDate && new Date(item.dueDate) < currentDate && item.status === 'Incomplete') {
        return true;
      }
      return false;
    })
    return overdueTasks;
  }



  useEffect(() => {
    initializeTasksFromLocalStorage();
    if (newTaskCreation) {

      console.log(task);
      console.log(taskData);
      updateLocalStorage([...taskData]);
      setpriorityFilter("All");
      setstatusFilter("All");
      setnewTaskCreation(false);
    }
  }, [statusFilter, priorityFilter, newTaskCreation]);


  return (
    <div className='App container'>
      <section >
        <h3 className='justify-content-center m-3 section__subtitle'>All Tasks</h3>

        <button type="button"
          className="btn btn-primary m-2 float-start primary__btn"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
          onClick={() => { createModal() }}>
          Add Tasks
        </button>

        <input
          type="text"
          placeholder="Search by Task Title..."
          value={searchTerm}
          onChange={handleSearchChange}
          className='mt-3 float-end border'
        />
        <button className='mt-3 float-end border secondary__btn'>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
        </button>
        {/*Table Section start */}
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>
                Task ID
              </th>
              <th>
                Task Title
              </th>
              <th>
                Task Description
              </th>
              <th>
                Due Date
              </th>
              <th>
                <div className="dropdown">
                  <span id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false">
                    Priority<svg className="mx-2 mb-1 bi bi-funnel" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                    </svg>
                  </span>
                  <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
                    <li><button className="dropdown-item" type="button" onClick={handlePriorityFilterChange} name='priority' value='All'>All</button></li>
                    <li><button className="dropdown-item" type="button" onClick={handlePriorityFilterChange} name='priority' value='Low'>Low</button></li>
                    <li><button className="dropdown-item" type="button" onClick={handlePriorityFilterChange} name='priority' value='Medium'>Medium</button></li>
                    <li><button className="dropdown-item" type="button" onClick={handlePriorityFilterChange} name='priority' value='High'>High</button></li>

                  </ul>
                </div>
              </th>
              <th>

                <div className="dropdown">
                  <span id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false">
                    Status<svg className="mx-1 mb-1 bi bi-funnel" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                    </svg>
                  </span>
                  <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
                    <li><button className="dropdown-item" type="button" onClick={handleStatusFilterChange} name='status' value='All'>All</button></li>
                    <li><button className="dropdown-item" type="button" onClick={handleStatusFilterChange} name='status' value='Incomplete'>Incomplete</button></li>
                    <li><button className="dropdown-item" type="button" onClick={handleStatusFilterChange} name='status' value='Complete'>Complete</button></li>
                  </ul>
                </div>
              </th>
              <th>
                Options
              </th>
            </tr>
          </thead>
          <tbody>
            {
              filterTasks(priorityFilter, statusFilter, searchTerm, false).map((item, index) => (
                <tr key={index}>
                  <td>{item.taskId}</td>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.priority}
                  </td>
                  <td>{item.status}</td>
                  <td>
                    <button className='btn btn-light mr-1 secondary__btn'

                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      onClick={() => editModal(item)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                      </svg>         </button>
                    <button className='btn btn-light mr-1 secondary__btn'
                      onClick={() => deleteTask(item.taskId)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                      </svg> </button>
                  </td>
                </tr>
              ))
            }
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-light mx-2 "
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className="btn btn-light mx-2"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === Math.ceil(taskData.length / recordsPerPage)}
              >
                Next
              </button>
            </div>

          </tbody>
        </table>
      </section>
      {/*Table Section end */}
      {/*Modal Section Start */}
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header text-center">
              <h5 className="modal-title section__subtitle">{modalTitle}</h5>
              <button type="button " className="btn-close bg-danger" data-bs-dismiss="modal" aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <div className="d-flex flex-row bd-highlight mb-3">

                <div className="p-2 w-50 bd-highlight">


                  {task.taskId !== 0 ? <div className="input-group mb-3">
                    <span className="input-group-text">Task ID</span>
                    <input type="Number" className="form-control"
                      value={task.taskId}
                      name='id' disabled />
                  </div> : null}


                  <div className="input-group mb-3">
                    <span className="input-group-text">Task Name</span>
                    <input type="text" className="form-control"
                      value={task.title}
                      onChange={handleChange} name='title' />
                  </div>

                  <div className="input-group mb-3">
                    <span className="input-group-text">Task Description</span>
                    <input type="text" className="form-control"
                      value={task.description}
                      onChange={handleChange} name='description' />
                  </div>


                  <div className="input-group mb-3">
                    <span className="input-group-text">Due Date</span>
                    <input type="date" className="form-control"
                      value={task.dueDate}
                      onChange={handleChange} name='dueDate' />
                  </div>

                  <div className="input-group mb-3">
                    <span className="input-group-text">Priority</span>
                    <select
                      id="dropdown"
                      value={task.priority}
                      onChange={handleChange}
                      name='priority'
                    >
                      <option value="All">Select...</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  {task.taskId !== 0 ? <div className="input-group mb-3">
                    <span className="input-group-text">Status</span>
                    <select
                      id="dropdown"
                      value={task.status}
                      onChange={handleChange}
                      name='status'
                    >
                      <option value="All">Select...</option>
                      <option value="Complete">Complete</option>
                      <option value="Incomplete">Incomplete</option>
                    </select>
                  </div> : null}


                </div>
              </div>

              {task.taskId === 0 ?
                <button type="button"
                  className="btn btn-primary float-start"
                  onClick={() => { createTask() }}
                >Create</button>
                : null}

              {task.taskId !== 0 ?
                <button type="button"
                  className="btn btn-primary float-start"
                  onClick={() => { updateTask() }}
                >Update</button>
                : null}
            </div>

          </div>
        </div>
      </div>

      {/*Modal Section End */}


      {/*Upcoming Tasks start */}
      <section className='bg-warning'>
        <h3 className='d-flex justify-content-center m-3 section__subtitle'>UpComing Tasks</h3>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>
                Task ID
              </th>
              <th>
                Task Title
              </th>
              <th>
                Task Description
              </th>
              <th>
                Due Date
              </th>
              <th>
                Priority
              </th>
              <th>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {
              filterTasks('All', 'Incomplete', '', true).sort(compareDueDates).map((item, index) => (
                <tr key={index}>
                  <td>{item.taskId}</td>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.priority}
                  </td>
                  <td>{item.status}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>
      {/*Upcoming Tasks end */}

      {/*Overdue Tasks start */}
      <section className='bg-danger'>
        <h3 className='d-flex justify-content-center m-3 section__subtitle'>OverDue Tasks</h3>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>
                Task ID
              </th>
              <th>
                Task Title
              </th>
              <th>
                Task Description
              </th>
              <th>
                Due Date
              </th>
              <th>
                Priority
              </th>
              <th>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {
              getOverdueTasks().map((item, index) => (
                <tr key={index}>
                  <td>{item.taskId}</td>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.priority}
                  </td>
                  <td>{item.status}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>
      {/*OverDue Tasks end */}


      {/*Completed Tasks start */}
      <section className='bg-success'>
        <h3 className='d-flex justify-content-center m-3 section__subtitle'>Completed Tasks</h3>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>
                Task ID
              </th>
              <th>
                Task Title
              </th>
              <th>
                Task Description
              </th>
              <th>
                Due Date
              </th>
              <th>
                Priority
              </th>
            </tr>
          </thead>
          <tbody>
            {
              filterTasks('All', 'Complete', '', false).map((item, index) => (
                <tr key={index}>
                  <td>{item.taskId}</td>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.priority}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>

      {/*Completed Tasks end */}



    </div>


  )
}



export default Home