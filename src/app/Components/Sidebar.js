import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function Sidebar() {


  const pathname = usePathname();

  return (
    <div>
      <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
        <div className="app-brand demo">
          <Link href="index.html" className="aap-brand-link">
            <img src="/images/logo.png" width="45" />
            <span className="app-brand-text demo text-heading fw-semibold">&nbsp;Camrilla</span>
          </Link>

          <Link href="javascript:void(0);" className="layout-menu-toggle menu-link text-large ms-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.47365 11.7183C8.11707 12.0749 8.11707 12.6531 8.47365 13.0097L12.071 16.607C12.4615 16.9975 12.4615 17.6305 12.071 18.021C11.6805 18.4115 11.0475 18.4115 10.657 18.021L5.83009 13.1941C5.37164 12.7356 5.37164 11.9924 5.83009 11.5339L10.657 6.707C11.0475 6.31653 11.6805 6.31653 12.071 6.707C12.4615 7.09747 12.4615 7.73053 12.071 8.121L8.47365 11.7183Z"
                fill-opacity="0.9" />
              <path
                d="M14.3584 11.8336C14.0654 12.1266 14.0654 12.6014 14.3584 12.8944L18.071 16.607C18.4615 16.9975 18.4615 17.6305 18.071 18.021C17.6805 18.4115 17.0475 18.4115 16.657 18.021L11.6819 13.0459C11.3053 12.6693 11.3053 12.0587 11.6819 11.6821L16.657 6.707C17.0475 6.31653 17.6805 6.31653 18.071 6.707C18.4615 7.09747 18.4615 7.73053 18.071 8.121L14.3584 11.8336Z"
                fill-opacity="0.4" />
            </svg>
          </Link>
        </div>

        <div className="menu-inner-shadow"></div>

        <ul className="menu-inner py-1">

          <li className={`menu-item ${pathname === '/' ? 'active':''}`}>
            <Link href="/" className="menu-link ">
              <i className="menu-icon tf-icons ri-bar-chart-line"></i>
              <div data-i18n="Dashboards">Dashboards</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Assignments' ? 'active':''}`}>
            <Link href="/Assignments" className="menu-link ">
              <i className="menu-icon  tf-icons ri-bill-line"></i>
              <div data-i18n="Assignments">Assignments</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Leads' ? 'active':''} `}>
            <Link href="/Leads" className="menu-link ">
              <i className="menu-icon tf-icons ri-edit-line"></i>
              <div data-i18n="Leads">Leads</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Subscriptions' ? 'active':''} `}>
            <Link href="/Subscriptions" className="menu-link">
              <i className="menu-icon tf-icons ri-bank-card-line"></i>
              <div data-i18n="Subscription">Subscription</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Feedback' ? 'active':''} `}>
            <Link href="/Feedback" className="menu-link">
              <i className="menu-icon tf-icons ri-discuss-line"></i>
              <div data-i18n="Feedback">Feedback</div>
            </Link>
          </li>

          <li class="menu-header mt-5">
            <span class="menu-header-text">User &amp; Profile</span>
          </li>

          <li className={`menu-item ${pathname === '/Profile' ? 'active':''} `}>
            <Link href="/Profile" className="menu-link">
              <i className="menu-icon tf-icons ri-user-line"></i>
              <div data-i18n="My Profile">My Profile</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Settings' ? 'active':''}`}>
            <Link href="/Settings" className="menu-link">
              <i className="menu-icon tf-icons ri-settings-3-line"></i>
              <div data-i18n="Settings">Settings</div>
            </Link>
          </li>

          <li class="menu-header mt-5">
            <span class="menu-header-text">Join &amp; Us </span>
          </li>

          <li className="menu-item">
            <Link href="https://camrilla.com/" target='_blank' className="menu-link">
              <i className="menu-icon tf-icons ri-global-line"></i>
              <div data-i18n="Website">Website</div>
            </Link>
          </li>

          <li className="menu-item">
            <Link href="https://www.facebook.com/camrillathecommunity/" target='_blank' className="menu-link">
              <i className="menu-icon tf-icons ri-facebook-circle-fill"></i>
              <div data-i18n="Facebook">Facebook</div>
            </Link>
          </li>

          <li className="menu-item">
            <Link href="https://www.instagram.com/camrilla_photography_club/" target='_blank' className="menu-link">
              <i className="menu-icon tf-icons ri-instagram-line"></i>
              <div data-i18n="Instagram">Instagram</div>
            </Link>
          </li>



        </ul>
      </aside>

    </div>
  )
}
