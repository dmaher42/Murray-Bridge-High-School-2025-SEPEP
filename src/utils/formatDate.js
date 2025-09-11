/**
 * Format date string to human-friendly format
 * @param {string} dateString - ISO date string (e.g., "2025-02-10")
 * @returns {string} - Formatted date (e.g., "10 Feb 2025")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString + 'T00:00:00'); // Avoid timezone issues
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}