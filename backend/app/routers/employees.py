from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..db import get_db
from ..models import Employee
from ..schemas import (
    EmployeeAdminOut,
    EmployeeCreate,
    EmployeeImportRow,
    EmployeeUpdate,
    UserOut,
)

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=List[EmployeeAdminOut])
def list_employees(
    dept: str = "All",
    status: str = "All",
    db: Session = Depends(get_db),
    _admin: UserOut = Depends(require_admin),
) -> List[Employee]:
    q = select(Employee)
    if status != "All":
        q = q.where(Employee.status == status)
    if dept != "All":
        q = q.where(Employee.dept == dept)
    return list(db.scalars(q.order_by(Employee.name)).all())


@router.post("", response_model=EmployeeAdminOut, status_code=201)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    _admin: UserOut = Depends(require_admin),
) -> Employee:
    if db.get(Employee, payload.id):
        raise HTTPException(status_code=409, detail="Employee id already exists")
    emp = Employee(
        id=payload.id,
        name=payload.name,
        first=payload.name.split(" ")[0],
        role=payload.role,
        dept=payload.dept,
        photo_url=payload.photo_url,
        admin_locked=True,  # manually created -> protect from re-sync
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@router.patch("/{employee_id}", response_model=EmployeeAdminOut)
def edit_employee(
    employee_id: str,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    _admin: UserOut = Depends(require_admin),
) -> Employee:
    emp = db.get(Employee, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(emp, k, v)
    if "name" in data:
        emp.first = data["name"].split(" ")[0]
    emp.admin_locked = True  # admin-edits-win: protect from re-sync overwrite
    db.commit()
    db.refresh(emp)
    return emp


@router.post("/import")
def import_employees(
    rows: List[EmployeeImportRow],
    db: Session = Depends(get_db),
    _admin: UserOut = Depends(require_admin),
) -> dict:
    # Idempotent upsert keyed on HRIS id. Admin-locked records are not overwritten.
    created, updated, skipped = 0, 0, 0
    for row in rows:
        emp = db.get(Employee, row.id)
        if emp is None:
            db.add(
                Employee(
                    id=row.id,
                    name=row.name,
                    first=row.name.split(" ")[0],
                    role=row.role,
                    dept=row.dept,
                    photo_url=row.photo_url,
                )
            )
            created += 1
        elif emp.admin_locked:
            skipped += 1
        else:
            emp.name = row.name
            emp.first = row.name.split(" ")[0]
            emp.role = row.role
            emp.dept = row.dept
            if row.photo_url:
                emp.photo_url = row.photo_url
            updated += 1
    db.commit()
    return {"created": created, "updated": updated, "skipped_admin_locked": skipped}
