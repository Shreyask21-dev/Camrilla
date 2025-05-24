import React from 'react';

const AvatarInitials = ({ name }) => {
  // Extract initials from name
  const initials = name
    ? name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
    : '';

  return (
    <div
      className="avatar avatar-online rounded-circle d-flex justify-content-center align-items-center"
      style={{
        width: '40px',
        height: '40px',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '20px',
        fontWeight: 'bold',
        userSelect: 'none',
      }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default AvatarInitials;

