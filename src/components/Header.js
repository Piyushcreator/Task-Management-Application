import React from 'react'
import '../App.css'
import logo from '../assets/images/todo.png'

const Header = () => {
  return (
    <header>
      <div class="container">
        <div class="row">
          <div className=" d-flex align-items-center  ">

            {/*Logo*/}
            <div className="logo">
              <img src={logo} alt="" />
            </div>
            <div className='d-flex align-items-center text-center'><h3 className='section__title'>Task Managemnet Application</h3></div>
            
            </div>
          </div>
        </div>
    </header>
  )
}

export default Header