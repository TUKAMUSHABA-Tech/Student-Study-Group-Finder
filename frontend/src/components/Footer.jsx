import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '1.05rem', fontWeight: 700 }}>
            Uganda Christian University (UCU)
          </h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            A Centre of Excellence in the Heart of Africa. Mukono Campus, Uganda.<br />
            Faculty of Science and Technology.<br />
            Department of Computing and Technology.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '1.05rem', fontWeight: 700 }}>
            Academic Faculties
          </h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', lineHeight: 2 }}>
            <li>Faculty of Science and Technology</li>
            <li>Faculty of Business and Administration</li>
            <li>Faculty of Law (Bishop Tucker)</li>
            <li>Faculty of Social Sciences & Education</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '0.75rem', fontSize: '1.05rem', fontWeight: 700 }}>
            Course Assignment Info
          </h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong>Unit:</strong> Web & Mobile Application Development<br />
            <strong>Programme:</strong> Bachelor of Science in Information Technology<br />
            <strong>Year of Study:</strong> Year One Academic Project<br />
            <strong>Tech Stack:</strong> React.js, Node.js, Express, MySQL
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Uganda Christian University - Student Study Group Finder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
