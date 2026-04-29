import frappe


@frappe.whitelist()
def get_template_subtasks(doctype, txt, searchfield, start, page_len, filters):

    parent_task = filters.get("parent_task")

    if not parent_task:
        return []

    task_doc = frappe.get_doc("Task", parent_task)

    depends_tasks = [

        d.task

        for d in task_doc.depends_on

        if d.task

    ]

    if not depends_tasks:
        return []

    return frappe.db.sql("""

        SELECT name, subject

        FROM `tabTask`

        WHERE name IN %(tasks)s

        AND name LIKE %(txt)s

        LIMIT %(page_len)s OFFSET %(start)s

    """, {

        "tasks": tuple(depends_tasks),

        "txt": f"%{txt}%",

        "page_len": page_len,

        "start": start

    })