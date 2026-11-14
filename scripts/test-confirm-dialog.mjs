import fs from "fs";
import path from "path";

console.log("==================================================================");
console.log("TEST SUITE: CONFIRM DIALOG ACCESSIBILITY, CANCELLATION & LAYOUT");
console.log("==================================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    testsFailed++;
  }
}

// 1. Inspect ConfirmDialog Component Source
console.log("\n1. Verifying ConfirmDialog Accessibility & Behavior Implementation...");
const dialogCode = fs.readFileSync("components/common/ConfirmDialog.tsx", "utf8");

assert(dialogCode.includes('role="alertdialog"'), 'Has role="alertdialog"');
assert(dialogCode.includes('aria-modal="true"'), 'Has aria-modal="true"');
assert(dialogCode.includes('aria-labelledby="confirm-dialog-title"'), 'Has aria-labelledby="confirm-dialog-title"');
assert(dialogCode.includes('aria-describedby="confirm-dialog-description"'), 'Has aria-describedby="confirm-dialog-description"');
assert(dialogCode.includes('e.key === "Escape"'), 'Handles Escape key press');
assert(dialogCode.includes('!isLoading'), 'Prevents Escape and backdrop dismiss while action is loading');
assert(dialogCode.includes('e.key === "Tab"'), 'Implements keyboard focus trapping (Tab & Shift+Tab cycle)');
assert(dialogCode.includes('previousActiveElement.current.focus()'), 'Restores focus to trigger button upon close');
assert(dialogCode.includes('cancelBtnRef.current.focus()'), 'Initializes focus on safe/secondary cancel button');

// 2. Mobile 320px screen responsiveness check
console.log("\n2. Verifying 320px Mobile Screen Constraints...");
assert(dialogCode.includes("max-w-md"), 'Constrains dialog with max-w-md');
assert(dialogCode.includes("p-3 sm:p-4") || dialogCode.includes("p-4"), 'Includes responsive outer container padding');
assert(dialogCode.includes("flex flex-col-reverse sm:flex-row"), 'Buttons stack vertically on mobile (flex-col-reverse) and side-by-side on desktop');
assert(dialogCode.includes("min-h-[44px]"), 'Action buttons provide touch target of at least 44px for mobile');

// 3. Inspect Customer Dashboard Cancellation Dialog Implementation
console.log("\n3. Verifying Customer Booking Cancellation Dialog in Dashboard...");
const dashboardCode = fs.readFileSync("app/dashboard/page.tsx", "utf8");

// Zero native browser dialogs remain
assert(!dashboardCode.includes("window.confirm("), 'No window.confirm remaining in dashboard');
assert(!dashboardCode.includes("window.alert("), 'No window.alert in dashboard');
assert(!dashboardCode.includes("window.prompt("), 'No window.prompt in dashboard');

// Required Title & Content
assert(dashboardCode.includes('title="Cancel this booking request?"'), 'Dialog title is "Cancel this booking request?"');
assert(dashboardCode.includes('bookingToCancel.reference_code'), 'Displays reservation reference code');
assert(dashboardCode.includes('bookingToCancel.cars'), 'Displays car name');
assert(dashboardCode.includes('pickup_date') && dashboardCode.includes('return_date'), 'Displays pickup and return dates');
assert(
  dashboardCode.includes("The dates will be released. You can book again anytime."),
  'Displays reassurance line "The dates will be released. You can book again anytime."'
);

// Required Buttons
assert(dashboardCode.includes('confirmLabel="Cancel booking"'), 'Confirm button is labeled "Cancel booking"');
assert(dashboardCode.includes('cancelLabel="Keep booking"'), 'Secondary button is labeled "Keep booking"');
assert(dashboardCode.includes('loadingLabel="Cancelling..."'), 'Shows "Cancelling..." loading state');
assert(dashboardCode.includes('confirmVariant="danger"'), 'Confirm button is styled with red danger variant');

// Required Toast Notification afterwards
assert(dashboardCode.includes("Reservation ${refCode} has been cancelled"), 'Shows success toast notification on cancel');
assert(dashboardCode.includes("Failed to cancel reservation"), 'Shows error toast notification on failure');

// 4. Inspect Admin BookingTable Integration
console.log("\n4. Verifying Admin BookingTable Integration with ConfirmDialog...");
const adminTableCode = fs.readFileSync("components/admin/BookingTable.tsx", "utf8");
assert(adminTableCode.includes("<ConfirmDialog"), 'Admin BookingTable reuses ConfirmDialog component');
assert(adminTableCode.includes("Delete Reservation Permanently?"), 'Handles permanent booking deletion with ConfirmDialog');
assert(adminTableCode.includes("Remove Manual Block?"), 'Handles manual block removal with ConfirmDialog');

// 5. Inspect Admin DeleteCarModal Integration
console.log("\n5. Verifying Admin DeleteCarModal Integration with ConfirmDialog...");
const deleteCarCode = fs.readFileSync("components/admin/DeleteCarModal.tsx", "utf8");
assert(deleteCarCode.includes("<ConfirmDialog"), 'DeleteCarModal reuses ConfirmDialog component');

console.log("\n==================================================================");
console.log(`TEST SUMMARY: ${testsPassed} passed, ${testsFailed} failed`);
console.log("==================================================================");

if (testsFailed > 0) {
  process.exit(1);
}
