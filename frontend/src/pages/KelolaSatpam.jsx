import { useEffect, useState } from "react";
import AdminTopbar from "../components/AdminTopbar";
import AdminSidebar from "../components/AdminSidebar";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { penugasanAPI } from "../service/api";
import "./KelolaUser.css";
import { FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";

export default function KelolaSatpam() {
  const [satpam, setSatpam] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSatpam, setEditingSatpam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({ nama_satpam: "", kontak: "", status: "aktif" });

  useEffect(() => { fetchSatpam(); }, []);

  const fetchSatpam = async () => {
    setLoading(true);
    try {
      const response = await penugasanAPI.getSatpam();
      setSatpam(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data satpam");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setFormData({ nama_satpam: "", kontak: "", status: "aktif" });

  const handleOpenModal = (item = null) => {
    setEditingSatpam(item);
    setFormData(item ? { nama_satpam: item.nama_satpam, kontak: item.kontak || "", status: item.status || "aktif" } : { nama_satpam: "", kontak: "", status: "aktif" });
    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSatpam(null);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.nama_satpam.trim() || !formData.kontak.trim()) {
      setError("Nama satpam dan kontak wajib diisi");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = { nama_satpam: formData.nama_satpam.trim(), kontak: formData.kontak.trim(), status: formData.status };
      if (editingSatpam) {
        const response = await penugasanAPI.updateSatpam(editingSatpam.id_satpam, payload);
        setSatpam((previous) => previous.map((item) => item.id_satpam === editingSatpam.id_satpam ? response.data.data : item));
      } else {
        const response = await penugasanAPI.createSatpam(payload);
        setSatpam((previous) => [...previous, response.data.data]);
      }
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data satpam");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await penugasanAPI.deleteSatpam(deleteItem.id_satpam);
      setSatpam((previous) => previous.filter((item) => item.id_satpam !== deleteItem.id_satpam));
      setShowDeleteModal(false);
      setDeleteItem(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus data satpam");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSatpam = satpam.filter((item) => `${item.nama_satpam} ${item.kontak}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="kelola-user-page">
      <AdminSidebar />
      <main className="kelola-user-main">
        <AdminTopbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Cari satpam..." />
        <section className="content">
          <div className="header"><div><h1>Kelola Satpam</h1><p>Kelola data petugas keamanan</p></div><button className="btn-add" onClick={() => handleOpenModal()}><FiPlus /> Tambah Data</button></div>
          {error && <div className="error-message" style={{ color: "red", marginBottom: "16px" }}>{error}</div>}
          <div className="table-box">
            <table>
              <thead><tr><th>ID</th><th>Nama Satpam</th><th>Kontak</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="5" className="empty">Loading...</td></tr> : filteredSatpam.length > 0 ? filteredSatpam.map((item) => (
                  <tr key={item.id_satpam}><td>SAT-{String(item.id_satpam).padStart(3, "0")}</td><td><div className="user-row"><div className="mini-avatar">{item.nama_satpam?.charAt(0)}</div>{item.nama_satpam}</div></td><td>{item.kontak}</td><td><span className={`status ${item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}`}>{item.status}</span></td><td className="aksi"><FiEdit2 onClick={() => handleOpenModal(item)} style={{ color: "#3b82f6", cursor: "pointer" }} /><FiTrash2 onClick={() => { setDeleteItem(item); setShowDeleteModal(true); }} style={{ color: "#ef4444", cursor: "pointer", marginLeft: "12px" }} /></td></tr>
                )) : <tr><td colSpan="5" className="empty">Tidak ada data satpam</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal && <div className="user-modal-overlay" onClick={handleCloseModal}><div className="user-modal-content" onClick={(event) => event.stopPropagation()}><div className="modal-header"><h2>{editingSatpam ? "Edit Satpam" : "Tambah Satpam"}</h2><FiX onClick={handleCloseModal} /></div><form onSubmit={handleSubmit}><input placeholder="Nama Satpam" value={formData.nama_satpam} onChange={(event) => setFormData({ ...formData, nama_satpam: event.target.value })} /><input placeholder="No Kontak" value={formData.kontak} onChange={(event) => setFormData({ ...formData, kontak: event.target.value })} /><select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })}><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select><div className="modal-actions"><button type="button" onClick={handleCloseModal}>Batal</button><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></div></form></div></div>}
      <DeleteConfirmation show={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteItem(null); }} onConfirm={handleDelete} title="Hapus Satpam" message={`Apakah Anda yakin ingin menghapus satpam "${deleteItem?.nama_satpam}"?`} isDeleting={isDeleting} />
    </div>
  );
}