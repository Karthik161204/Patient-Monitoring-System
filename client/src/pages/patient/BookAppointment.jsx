import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const pad = (n) => String(n).padStart(2, "0");

const getCalendarDates = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  return {
    year,
    month,
    today: today.getDate(),
    firstWeekday: new Date(year, month, 1).getDay(),
    lastDay,
  };
};

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const calendar = getCalendarDates();
  const monthLabel = new Date(calendar.year, calendar.month).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    api.get(`/doctors/${id}`).then((res) => setDoctor(res.data));
  }, [id]);

  useEffect(() => {
    setError("");
    if (!doctor) return;

    if (!doctor.available) {
      setError("This doctor is currently unavailable for appointments");
      setAvailableSlots([]);
      setSelectedTime("");
      setLoadingSlots(false);
      return;
    }
    if (!selectedDate) {
      setAvailableSlots([]);
      setSelectedTime("");
      return;
    }

    let active = true;
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedTime("");
    api
      .get(`/appointments/availability/${id}`, { params: { date: selectedDate } })
      .then((res) => {
        if (active) setAvailableSlots(res.data.availableSlots);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Could not load available times");
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [doctor, id, selectedDate]);

  const handleBook = async () => {
    setError("");
    if (!doctor?.available) {
      setError("This doctor is currently unavailable for appointments");
      return;
    }
    if (!selectedDate) {
      setError("Please select an appointment date");
      return;
    }
    if (!selectedTime) {
      setError("Please select an available time slot");
      return;
    }
    try {
      const res = await api.post("/appointments", {
        doctorId: id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      });
      setConfirmation(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
      if (err.response?.status === 409) {
        setSelectedTime("");
        api
          .get(`/appointments/availability/${id}`, { params: { date: selectedDate } })
          .then((res) => setAvailableSlots(res.data.availableSlots))
          .catch(() => setAvailableSlots([]));
      }
    }
  };

  if (!doctor) return <p className="muted">Loading...</p>;

  if (confirmation) {
    const [y, m, d] = (confirmation.appointmentDate || "").split("-").map(Number);
    const dateLabel =
      y && m && d
        ? new Date(y, m - 1, d).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : confirmation.appointmentDate;

    return (
      <div>
        <h3>Appointment Confirmed</h3>
        <div className="confirmation-box">
          <p>
            <strong>Patient:</strong> {confirmation.patient?.user?.name}
          </p>
          <p>
            <strong>Doctor:</strong> {confirmation.doctor?.user?.name}
          </p>
          <p>
            <strong>Specialty:</strong> {confirmation.doctor?.specialty}
          </p>
          <p>
            <strong>Date:</strong> {dateLabel}
          </p>
          <p>
            <strong>Time:</strong> {confirmation.appointmentTime}
          </p>
          <p>
            <strong>Token:</strong>{" "}
            <span className="token">{String(confirmation.tokenNumber).padStart(2, "0")}</span>
          </p>
          <p>
            <strong>Status:</strong> {confirmation.status}
          </p>
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => navigate("/patient/appointments")}>
            Go to My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>Book Appointment with {doctor.user?.name}</h3>
      <p className="muted">
        {doctor.specialty} &middot; {doctor.experience} years experience
      </p>

      {error && <p className="error-text">{error}</p>}

      {!doctor.available ? (
        <p className="doctor-unavailable-message">
          This doctor is currently unavailable and cannot be booked.
        </p>
      ) : (
        <>
      <div className="appointment-calendar" aria-label="Choose an appointment date">
        <div className="calendar-heading">
          <div>
            <p className="calendar-eyebrow">Appointment date</p>
            <h4>{monthLabel}</h4>
          </div>
          <span className="calendar-month-note">This month</span>
        </div>
        <div className="calendar-grid calendar-weekdays" aria-hidden="true">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid" role="group" aria-label={`${monthLabel} dates`}>
          {Array.from({ length: calendar.firstWeekday }, (_, index) => (
            <span className="calendar-empty" key={`empty-${index}`} aria-hidden="true" />
          ))}
          {Array.from({ length: calendar.lastDay }, (_, index) => {
            const day = index + 1;
            const iso = `${calendar.year}-${pad(calendar.month + 1)}-${pad(day)}`;
            const isPast = day < calendar.today;
            const isSelected = selectedDate === iso;
            return (
              <button
                className={`calendar-day${isSelected ? " selected" : ""}${day === calendar.today ? " today" : ""}`}
                key={iso}
                type="button"
                disabled={isPast}
                aria-pressed={isSelected}
                aria-label={new Date(calendar.year, calendar.month, day).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
                onClick={() => setSelectedDate(iso)}
              >
                {day}
              </button>
            );
          })}
        </div>
        <p className="calendar-selection" aria-live="polite">
          {selectedDate
            ? new Date(calendar.year, calendar.month, Number(selectedDate.slice(-2))).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Select a date to continue"}
        </p>
      </div>

      {selectedDate && (
        <section className="time-slot-section" aria-labelledby="time-slot-title">
          <h4 id="time-slot-title">Available time slots</h4>
          {loadingSlots ? (
            <p className="muted">Loading available times...</p>
          ) : availableSlots.length === 0 ? (
            <p className="muted">No available times for this date. Choose another date.</p>
          ) : (
            <div className="time-slot-grid">
              {availableSlots.map((time) => (
                <button
                  className={`time-slot${selectedTime === time ? " selected" : ""}`}
                  key={time}
                  type="button"
                  aria-pressed={selectedTime === time}
                  onClick={() => {
                    setSelectedTime(time);
                    setError("");
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <button className="btn btn-primary" onClick={handleBook} disabled={!selectedDate || !selectedTime || loadingSlots}>
        Confirm Appointment
      </button>
        </>
      )}
    </div>
  );
};

export default BookAppointment;
