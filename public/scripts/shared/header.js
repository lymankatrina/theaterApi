const getCurrentUser = async () => {
  const response = await fetch('/users/me');

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Unable to get current user');
  }

  return response.json();
};

const getHeader = async (headerUrl) => {
  const response = await fetch(headerUrl);

  if (!response.ok) {
    throw new Error('Unable to load header');
  }

  return response.text();
};

const renderHeader = async () => {
  const headerPlaceholder = document.getElementById('header-placeholder');

  if (!headerPlaceholder) {
    return;
  }

  try {
    const user = await getCurrentUser();

    let headerUrl = '/pages/partials/header.html';

    if (user?.role === 'admin') {
      headerUrl = '/pages/partials/adminHeader.html';
    } else if (user) {
      headerUrl = '/pages/partials/loggedInHeader.html';
    }

    const headerHtml = await getHeader(headerUrl);

    const modifiedHeaderHtml = user ? headerHtml.replace('{{userName}}', user.userName) : headerHtml;

    headerPlaceholder.innerHTML = modifiedHeaderHtml;

    setActiveNavLink();
  } catch (error) {
    console.error('Error rendering header:', error);
  }
};

const setActiveNavLink = () => {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('#main-header nav a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');

    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

document.addEventListener('DOMContentLoaded', renderHeader);
