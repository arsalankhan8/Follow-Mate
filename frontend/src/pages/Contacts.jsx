import { useEffect, useState } from "react";
import { useModal } from "../components/context/ModalContext.jsx";
import ContactForm from "../components/forms/ContactForm";
import DashboardSidebar from "../components/DashboardSidebar.jsx";
import HeaderSection from "../components/HeaderSection.jsx";
import AppModal from "../components/modals/AppModal.jsx";
import API from "../lib/api";

export default function Contacts() {
  const { openModal } = useModal();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Open modal listener
  useEffect(() => {
    const handler = () => openModal(<ContactForm />);
    window.addEventListener("open-create-modal", handler);
    return () => window.removeEventListener("open-create-modal", handler);
  }, []);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use API instance
      const res = await API.get("/contacts");
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch contacts. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    
    // Listen for contacts update event
    const handler = () => fetchContacts();
    window.addEventListener("contacts-updated", handler);
    return () => window.removeEventListener("contacts-updated", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-56 flex-1 p-4">
        <HeaderSection />
        <AppModal />

        {loading && <p>Loading contacts...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && contacts.length === 0 && (
          <p>No contacts found</p>
        )}

        {!loading && !error && contacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div key={contact._id} className="p-4 bg-white shadow rounded">
                <h2 className="font-bold text-lg">{contact.fullName}</h2>
                {contact.role && <p>Role: {contact.role}</p>}
                {contact.company && <p>Company: {contact.company}</p>}
                <p>Status: {contact.status || "prospect"}</p>
                <p>Priority: {contact.priority || "medium"}</p>
                {contact.email && <p>Email: {contact.email}</p>}
                {contact.phone && <p>Phone: {contact.phone}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
