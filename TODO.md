# TODO: Fix Event List Not Updating Immediately After Creating Assignment

## Tasks
- [x] Add Authorization header to `fetchAssignments` function in `src/app/Components/AssignmentPage.js`
- [ ] Test the fix by creating a new assignment and verifying the list updates immediately

## Details
- The `fetchAssignments` function is called after creating a new assignment but lacks the Authorization header, causing the API call to fail silently.
- Adding the header will allow the function to successfully fetch updated assignments, ensuring the event list refreshes immediately.
