'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import classNames from 'classnames';
import useUserPlan from '../hooks/useUserPlan';

export default function Sidebar() {

  const planInfo = useUserPlan();

  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [wasManuallyCollapsed, setWasManuallyCollapsed] = useState(false);


  const handleToggle = () => {
    if (window.innerWidth >= 1200) {
      if (wasManuallyCollapsed) {
        // If already manually collapsed, second click expands
        setIsCollapsed(false);
        setWasManuallyCollapsed(false);
      } else {
        // First click collapses
        setIsCollapsed(true);
        setWasManuallyCollapsed(true);
      }
    } else {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  const handleMouseEnter = () => {
    if (wasManuallyCollapsed) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (wasManuallyCollapsed) {
      setIsCollapsed(true);
    }
  };

  return (
    <div>
      {/* className="layout-menu menu-vertical menu bg-menu-theme" */}
      <aside id="layout-menu"
        className={classNames('layout-menu menu-vertical menu bg-menu-theme', {
          'layout-menu-collapsed': isCollapsed && !isMobileOpen,
          'layout-menu-mobile': isMobileOpen,
          'layout-menu-expanded': !isCollapsed || isMobileOpen
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="app-brand demo">
          <Link href="index.html" className="aap-brand-link">
            <span style={{display:"flex", alignItems:"center"}}>
              <span>
                <img src="/images/logo.png" width="45" />
              </span>
              <span className="app-brand-text demo text-heading fw-semibold">&nbsp;Camrilla
                {planInfo?.planName === 'Professional' && (
                  <sup>
                    <span className="badge bg-success ms-2 rounded">PRO</span>
                  </sup>
                )}
              </span>
            </span>
          </Link>

        </div>

        <div className="menu-inner-shadow"></div>

        <ul className="menu-inner py-1">

          <li className={`menu-item ${pathname === '/' ? 'active' : ''}`}>
            <Link href="/" className="menu-link "

            >
              <i className="menu-icon tf-icons ri-bar-chart-line"></i>
              <div data-i18n="Dashboards">Dashboards</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Assignments' ? 'active' : ''}`}>
            <Link href="/Assignments" className="menu-link ">
              <i className="menu-icon  tf-icons ri-bill-line"></i>
              <div data-i18n="Assignments">Assignments</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Leads' ? 'active' : ''} `}>
            <Link href="/Leads" className="menu-link ">
              <i className="menu-icon tf-icons ri-edit-line"></i>
              <div data-i18n="Leads">Leads</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Subscriptions' ? 'active' : ''} `}>
            <Link href="/Subscriptions" className="menu-link">
              <i className="menu-icon tf-icons ri-bank-card-line"></i>
              <div data-i18n="Subscription">Subscription</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Feedback' ? 'active' : ''} `}>
            <Link href="/Feedback" className="menu-link">
              <i className="menu-icon tf-icons ri-discuss-line"></i>
              <div data-i18n="Feedback">Feedback</div>
            </Link>
          </li>

          <li class="menu-header mt-5">
            <span class="menu-header-text">User &amp; Profile</span>
          </li>

          <li className={`menu-item ${pathname === '/Profile' ? 'active' : ''} `}>
            <Link href="/Profile" className="menu-link">
              <i className="menu-icon tf-icons ri-user-line"></i>
              <div data-i18n="My Profile">My Profile</div>
            </Link>
          </li>

          <li className={`menu-item ${pathname === '/Settings' ? 'active' : ''}`}>
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
