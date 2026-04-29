// Copyright (c) 2026, QTPL and contributors
// For license information, please see license.txt

frappe.ui.form.on("Construction Type", {

    setup(frm) {

        frm.set_query("construction_uom", "material_details", function(doc) {

            let uom_list = [];

            // Collect UOM values from UOM child table
            (doc.uom || []).forEach(function(row) {
                if (row.uom) {
                    uom_list.push(row.uom);
                }
            });

            return {
                filters: [
                    ["name", "in", uom_list]
                ]
            };

        });

    }

});