fetch('/pages/partials/footer.html')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Unable to load footer');
    }
    return response.text();
  })
  .then((footerHtml) => {
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (!footerPlaceholder) {
      return;
    }

    footerPlaceholder.innerHTML = footerHtml;

    const currentYearElement = document.getElementById('currentYear');

    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }

    const updateDateElement = document.getElementById('updateDate');

    if (updateDateElement) {
      updateDateElement.textContent = document.lastModified;
    }
  })
  .catch((error) => {
    console.error('Error loading footer:', error);
  });
