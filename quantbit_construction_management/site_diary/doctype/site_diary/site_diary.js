// Copyright (c) 2026, QTPL and contributors
// For license information, please see license.txt

frappe.ui.form.on("Manpower Log", {

    skilled(frm, cdt, cdn) {
        calculate_total(cdt, cdn);
    },

    unskilled(frm, cdt, cdn) {
        calculate_total(cdt, cdn);
    },

    supervisors(frm, cdt, cdn) {
        calculate_total(cdt, cdn);
    },

    hours_worked(frm, cdt, cdn) {
        validate_hours(cdt, cdn);
    },

    overtime_hours(frm, cdt, cdn) {
        validate_hours(cdt, cdn);
    }

});


function calculate_total(cdt, cdn) {

    let row = locals[cdt][cdn];

    let total =
        (row.skilled || 0) +
        (row.unskilled || 0) +
        (row.supervisors || 0);

    frappe.model.set_value(cdt, cdn, "total", total);
}


function validate_hours(cdt, cdn) {

    let row = locals[cdt][cdn];

    let total_hours =
        (row.hours_worked || 0) +
        (row.overtime_hours || 0);

    if (total_hours < 0 || total_hours > 16) {

        frappe.msgprint(
            "Working Hours + Overtime Hours must be between 0 and 16"
        );

        frappe.model.set_value(cdt, cdn, "overtime_hours", 0);
    }
}