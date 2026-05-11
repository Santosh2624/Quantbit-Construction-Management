frappe.ui.form.on('Task', {
    refresh: function (frm) {

        calculate_task_bom_total(frm);
    }
});

frappe.ui.form.on('Task BOQ Details', {

    qty: function(frm, cdt, cdn) {
        calculate_row_amount(frm, cdt, cdn);
    },

    rate: function(frm, cdt, cdn) {
        calculate_row_amount(frm, cdt, cdn);
    }

});


function calculate_row_amount(frm, cdt, cdn) {

    let row = locals[cdt][cdn];

    row.total_amount = (flt(row.qty) || 0) * (flt(row.rate) || 0);

    frm.refresh_field('custom_bom_details');

    calculate_task_bom_total(frm);
}


