frappe.ui.form.on("Bill of Quantities", {
    refresh(frm){

    }
});

frappe.ui.form.on("BOQ Task Details", {

    async task(frm, cdt, cdn) {

        const row = locals[cdt][cdn];

        if (!row.task) return;

        const response = await frappe.call({
            method: "quantbit_construction_management.boq.doctype.bill_of_quantities.bill_of_quantities.get_boq_items_from_task",
            args: {
                task_name: row.task
            }
        });

        const items = response.message || [];

        if (!items.length) {
            frappe.msgprint(__("No dependent BOQ items found."));
            return;
        }

        items.forEach(d => {

            const child = frm.add_child("boq_items");

            Object.keys(d).forEach(key => {
                child[key] = d[key];
            });

        });

        frm.refresh_field("boq_items");

        frappe.show_alert({
            message: __("{0} item(s) added", [items.length]),
            indicator: "green"
        });
    },
    before_tasks_details_remove: function(frm, cdt, cdn) {
   const row = locals[cdt][cdn];
   if (!row.task) return;


   const rows_to_remove = (frm.doc.boq_items || []).filter(
       item => item.task === row.task
   );


   rows_to_remove.forEach(function(item) {
       frappe.model.clear_doc("BOQ Item", item.name);
   });


   frm.refresh_field("boq_items");


   frappe.show_alert({
       message: __("BOQ items removed for task: {0}", [row.task]),
       indicator: "orange"
   }, 4);
}

            
});

frappe.ui.form.on("BOQ Item", {

    internal_qty: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        const total = (row.internal_qty || 0) * (row.internal_rate || 0);
        frappe.model.set_value(cdt, cdn, "internal_amount", total);
    },

    internal_rate: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        const total = (row.internal_qty || 0) * (row.internal_rate || 0);
        frappe.model.set_value(cdt, cdn, "internal_amount", total);
    },

    actual_qty: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        const total = (row.actual_qty || 0) * (row.actual_rate || 0);
        frappe.model.set_value(cdt, cdn, "actual_amount", total);
    },

    actual_rate: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        const total = (row.actual_qty || 0) * (row.actual_rate || 0);
        frappe.model.set_value(cdt, cdn, "actual_amount", total);
    }

});


