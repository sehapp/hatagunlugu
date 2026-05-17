// src/app.js
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
    Plus, LogIn, LogOut, BookOpen, Calculator, FlaskConical, 
    Landmark, Moon, Languages, Image as ImageIcon, X, Trash2, Loader2, ChevronRight
} from 'lucide-react';
import { 
    auth, db, storage, googleProvider,
    signInWithPopup, signOut, onAuthStateChanged,
    collection, addDoc, query, where, getDocs, deleteDoc, doc, onSnapshot, orderBy,
    ref, uploadBytes, getDownloadURL
} from './firebase-config.js';

const SUBJECTS = [
    { id: 'turkce', name: 'Türkçe', icon: BookOpen, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'matematik', name: 'Matematik', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'fen', name: 'Fen Bilgisi', icon: FlaskConical, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'inkilap', name: 'İnkılap Tarihi', icon: Landmark, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'din', name: 'Din Kültürü', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'ingilizce', name: 'İngilizce', icon: Languages, color: 'text-cyan-500', bg: 'bg-cyan-50' }
];

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Questions Listener
    useEffect(() => {
        if (!user) return;
        
        const q = query(
            collection(db, 'questions'), 
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuestions(data);
        });

        return () => unsubscribe();
    }, [user]);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Giriş yapılamadı. Firebase yapılandırmanızı kontrol edin.");
        }
    };

    const handleLogout = () => signOut(auth);

    const getCountForSubject = (subjectId) => {
        return questions.filter(q => q.subjectId === subjectId).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!user) {
        return <LoginView onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200 px-4 py-4 mb-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/30">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Hata Günlüğü</h1>
                            <p className="text-xs text-slate-500">Yanlışlarını başarıya dönüştür</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Soru Ekle</span>
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                            title="Çıkış Yap"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                    {SUBJECTS.map((subject) => (
                        <div 
                            key={subject.id} 
                            onClick={() => setSelectedSubject(subject.id === selectedSubject ? null : subject.id)}
                            className={`subject-card ${selectedSubject === subject.id ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                        >
                            <div className={`${subject.bg} ${subject.color} p-4 rounded-full`}>
                                <subject.icon className="w-8 h-8" />
                            </div>
                            <h3 className="font-semibold text-slate-700">{subject.name}</h3>
                            <span className="text-2xl font-bold">{getCountForSubject(subject.id)}</span>
                        </div>
                    ))}
                </div>

                {/* Question List Area */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {selectedSubject 
                            ? `${SUBJECTS.find(s => s.id === selectedSubject).name} Soruları` 
                            : 'Tüm Sorular'}
                    </h2>
                    {selectedSubject && (
                        <button 
                            onClick={() => setSelectedSubject(null)}
                            className="text-sm font-medium text-primary-600 hover:underline"
                        >
                            Tümünü Göster
                        </button>
                    )}
                </div>

                {questions.length === 0 ? (
                    <div className="glass-card p-12 flex flex-col items-center text-center">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                            <ImageIcon className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">Henüz soru eklenmemiş</h3>
                        <p className="text-slate-500 max-w-sm mb-6">
                            Yanlış yaptığın soruların fotoğraflarını çekip buraya ekleyerek çalışmaya başlayabilirsin.
                        </p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary"
                        >
                            <Plus className="w-5 h-5" />
                            İlk Soruyu Ekle
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {questions
                            .filter(q => !selectedSubject || q.subjectId === selectedSubject)
                            .map(question => (
                                <QuestionCard key={question.id} question={question} />
                            ))
                        }
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <AddQuestionModal 
                    onClose={() => setIsModalOpen(false)} 
                    user={user} 
                />
            )}
        </div>
    );
};

const LoginView = ({ onLogin }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full glass-card p-8 text-center animate-slide-up">
            <div className="bg-primary-600 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl mb-6">
                <BookOpen className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Hata Günlüğü</h1>
            <p className="text-slate-500 mb-8">Hatalarını takip et, performansını artır ve sınava daha güçlü hazırlan.</p>
            
            <button 
                onClick={onLogin}
                className="w-full btn-primary justify-center py-4 text-lg"
            >
                <LogIn className="w-6 h-6" />
                Google ile Giriş Yap
            </button>
            <p className="mt-6 text-xs text-slate-400">Verilerin bulutta güvenle saklanır ve cihazların arasında senkronize edilir.</p>
        </div>
    </div>
);

const QuestionCard = ({ question }) => {
    const handleDelete = async () => {
        if (window.confirm("Bu soruyu silmek istediğine emin misin?")) {
            try {
                await deleteDoc(doc(db, 'questions', question.id));
            } catch (err) {
                console.error("Silme hatası:", err);
            }
        }
    };

    const subject = SUBJECTS.find(s => s.id === question.subjectId);

    return (
        <div className="glass-card overflow-hidden group animate-fade-in flex flex-col h-full bg-white">
            <div className="relative aspect-video bg-slate-200 overflow-hidden">
                <img 
                    src={question.imageUrl} 
                    alt="Soru" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${subject.bg} ${subject.color}`}>
                        {subject.name}
                    </span>
                </div>
                <button 
                    onClick={handleDelete}
                    className="absolute top-3 right-3 p-2 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                {question.note && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 italic">
                        "{question.note}"
                    </p>
                )}
                <div className="mt-auto flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    <span>{new Date(question.createdAt?.seconds * 1000).toLocaleDateString('tr-TR')}</span>
                    <div className="flex items-center gap-1 text-primary-500 group-hover:gap-2 transition-all">
                        <span>DETAY</span>
                        <ChevronRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddQuestionModal = ({ onClose, user }) => {
    const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);
    const [note, setNote] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert("Lütfen bir soru görseli seçin.");
        
        setUploading(true);
        try {
            // 1. Image Upload
            const imageRef = ref(storage, `questions/${user.uid}/${Date.now()}_${image.name}`);
            await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(imageRef);

            // 2. Firestore Doc
            await addDoc(collection(db, 'questions'), {
                userId: user.uid,
                subjectId,
                note,
                imageUrl,
                createdAt: new Date()
            });

            onClose();
        } catch (err) {
            console.error("Yükleme hatası:", err);
            alert("Bir hata oluştu. Firebase Storage/Firestore yetkilerini kontrol edin.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-lg overflow-hidden bg-white animate-slide-up">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-lg">Yeni Soru Ekle</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        {/* Subject Select */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Branş</label>
                            <div className="grid grid-cols-2 shadow-sm rounded-xl overflow-hidden border border-slate-200">
                                {SUBJECTS.map(s => (
                                    <button 
                                        key={s.id}
                                        type="button"
                                        onClick={() => setSubjectId(s.id)}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${subjectId === s.id ? s.bg + ' ' + s.color + ' font-bold' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <s.icon className="w-4 h-4" />
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Image Picker */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Soru Görseli</label>
                            <div 
                                className={`relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${preview ? 'border-primary-500 bg-slate-50' : 'border-slate-200 hover:border-primary-400'}`}
                            >
                                {preview ? (
                                    <div className="relative w-full h-full p-2">
                                        <img src={preview} className="w-full h-full object-contain rounded-xl" />
                                        <button 
                                            type="button"
                                            onClick={() => { setImage(null); setPreview(null); }}
                                            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center p-8">
                                        <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Plus className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">Görsel yüklemek için tıklayın</p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max 5MB)</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Note Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Not (Opsiyonel)</label>
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Soru ile ilgili notunuz..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none h-24"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            İptal
                        </button>
                        <button 
                            type="submit" 
                            disabled={uploading}
                            className="flex-[2] btn-primary justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Yükleniyor...
                                </>
                            ) : (
                                'Kaydet'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
