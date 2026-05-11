frappe.ui.form.on("Bill of Quantities", {
    refresh(frm) {
        render_combined_boq(frm);
    }
});

function remove_boq_items_for_task(frm, task_name) {
    if (!task_name) return;

    const rows_to_remove = (frm.doc.boq_items || []).filter(
        item => item.task === task_name
    );

    rows_to_remove.forEach(item => frappe.model.clear_doc("BOQ Item", item.name));

    frm.refresh_field("boq_items");

    frappe.show_alert({
        message: __("BOQ items removed for task: {0}", [task_name]),
        indicator: "orange"
    }, 4);
}

frappe.ui.form.on("BOQ Task Details", {

    async task(frm, cdt, cdn) {

        const row = locals[cdt][cdn];

        if (!row.task) {
            remove_boq_items_for_task(frm, row._prev_task);
            row._prev_task = null;
            return;
        }
        const is_duplicate = (frm.doc.tasks_details || []).some(
            r => r.task === row.task && r.name !== row.name
        );

        if (is_duplicate) {

            const task_doc = await frappe.db.get_doc("Task", row.task);

            frappe.model.set_value(cdt, cdn, "task", "");

            frappe.msgprint({
                title: __("Duplicate Task"),
                message: __("Task <b>{0}</b> is already added.", [task_doc.subject]),
                indicator: "red"
            });

            return;
        }

        if (row._prev_task && row._prev_task !== row.task) {
            remove_boq_items_for_task(frm, row._prev_task);
        }

        row._prev_task = row.task;

        const response = await frappe.call({
            method: "quantbit_construction_management.boq.doctype.bill_of_quantities.bill_of_quantities.get_boq_items_from_task",
            args: { task_name: row.task }
        });

        const items = response.message || [];

        if (!items.length) {
            frappe.msgprint(__("No dependent BOQ items found."));
            return;
        }

        items.forEach(d => {
            const child = frm.add_child("boq_items");
            Object.keys(d).forEach(key => { child[key] = d[key]; });
        });

        frm.refresh_field("boq_items");

        frappe.show_alert({
            message: __("{0} item(s) added", [items.length]),
            indicator: "green"
        });
    },

    before_tasks_details_remove: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        remove_boq_items_for_task(frm, row.task);
    }

});

frappe.ui.form.on("BOQ Item", {

    internal_qty: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, "internal_amount", (row.internal_qty || 0) * (row.internal_rate || 0));
    },

    internal_rate: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, "internal_amount", (row.internal_qty || 0) * (row.internal_rate || 0));
    },

    actual_qty: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, "actual_amount", (row.actual_qty || 0) * (row.actual_rate || 0));
    },

    actual_rate: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, "actual_amount", (row.actual_qty || 0) * (row.actual_rate || 0));
    }

});


function render_combined_boq(frm) {

    let boq_items = frm.doc.boq_items || [];

    if (!boq_items.length) {
        frm.fields_dict.combined_boq_details.$wrapper.html(
            `<div class="text-muted">No BOQ Items Found</div>`
        );
        return;
    }

    let grouped = {};
    boq_items.forEach(row => {
        if (!grouped[row.item_type]) grouped[row.item_type] = [];
        grouped[row.item_type].push(row);
    });

    let html = ``;

    Object.keys(grouped).forEach(item_type => {

        let items = grouped[item_type];
        let group_total = 0;

        html += `
            <div style="margin-bottom:20px;border:1px solid #d1d8dd;border-radius:8px;overflow:hidden;">
                <div style="background:#f7fafc;padding:12px;font-weight:bold;font-size:16px;border-bottom:1px solid #d1d8dd;">
                    ${item_type}
                </div>
                <table class="table table-bordered" style="margin-bottom:0;">
                    <thead>
                        <tr>
                            <th>Task</th><th>Subtask</th><th>Item</th>
                            <th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        items.forEach(row => {
            group_total += row.amount || 0;
            html += `
                <tr>
                    <td>${row.task || ""}</td>
                    <td>${row.subtask_name || ""}</td>
                    <td>${row.item_code || ""}</td>
                    <td>${row.quantity || 0}</td>
                    <td>${row.unit || ""}</td>
                    <td>₹ ${format_currency(row.unit_rate || 0)}</td>
                    <td>₹ ${format_currency(row.amount || 0)}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
                <div style="padding:10px;text-align:right;font-weight:bold;background:#fcfcfc;border-top:1px solid #d1d8dd;">
                    Group Total : ₹ ${format_currency(group_total)}
                </div>
            </div>
        `;
    });

    frm.fields_dict.combined_boq_details.$wrapper.html(html);
}