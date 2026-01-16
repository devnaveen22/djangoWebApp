import { useState } from 'react'
import { Login } from './Login'
import { Register } from './Register'
import './IntroPage.css'
import logo from '../assets/logo.jpeg'
import { Link } from 'react-router-dom'

export const IntroPage = () => {
    return (
        <div className="intro-page">
            <div className="decorative-circle decorative-circle-1"></div>
            <div className="decorative-circle decorative-circle-2"></div>

            <div className="content-wrapper">
                <div className="logo-container">
                    <div className="logo-circle">
                        <img
                            src={logo}
                            alt="SRM Lotto Logo"
                            className="logo-image"
                        />
                    </div>
                </div>

                <h1 className="main-title">SRM LOTTO</h1>

                <p className="subtitle">Your Gateway to Fortune</p>

                <div className="buttons-container">

                    <button
                        className="btn btn-login"
                    >
                        <Link to='/login'>
                            Login
                        </Link>
                    </button>

                    <button
                        className="btn btn-register"
                    >
                        <Link to='/register'>
                        Register
                        </Link>
                    </button>
                </div>
            </div>
        </div>
    )
}