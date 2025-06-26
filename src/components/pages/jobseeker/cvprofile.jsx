import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';
import { 
    FiUser, FiEdit3, FiSave, FiEye, FiDownload, FiUpload, 
    FiPlus, FiTrash2, FiMove, FiStar, FiAward, FiBook,
    FiPhone, FiMail, FiMapPin, FiLinkedin, FiGithub,
    FiBriefcase, FiSettings, FiMenu, FiGrid,
    FiFileText, FiAlertCircle, FiCheck, FiLoader, FiX
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import { 
//     CVPDFGenerator, 
//     CVFileProcessor, 
//     CVTemplates, 
//     CVValidator, 
//     CVStorage 
// } from '../../../utils/cvUtils.jsx';

// Simple local implementations to replace the utils
const CVValidator = {
    validateCV(cvData) {
        const errors = [];
        if (!cvData.personalInfo?.fullName?.trim()) errors.push('Full name is required');
        if (!cvData.personalInfo?.email?.trim()) errors.push('Email is required');
        if (!cvData.skills?.length) errors.push('At least one skill is required');
        return errors;
    }
};

const CVStorage = {
    save(cvData) {
        try {
            localStorage.setItem('cvProfile', JSON.stringify(cvData));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to save CV data' };
        }
    },
    
    load() {
        try {
            const data = localStorage.getItem('cvProfile');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }
};

const CVProfile = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [previewMode, setPreviewMode] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    
    // Enhanced CV data structure
    const [cvProfile, setCvProfile] = useState({
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedIn: '',
            github: '',
            portfolio: '',
            summary: ''
        },
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        projects: [],
        languages: [],
        interests: [],
        avatar: null,
        theme: {
            primaryColor: '#3B82F6',
            fontFamily: 'Inter',
            layout: 'modern'
        }
    });
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPdf, setShowPdf] = useState(false);
    const [activeSection, setActiveSection] = useState('personal');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [autoSave, setAutoSave] = useState(true);
    const [newSkillInput, setNewSkillInput] = useState('');

    // Section order management
    const [sectionOrder, setSectionOrder] = useState([
        'personalInfo',
        'summary', 
        'experience',
        'skills',
        'education',
        'projects',
        'certifications'
    ]);
    
    const [sectionVisibility, setSectionVisibility] = useState({
        personalInfo: true,
        summary: true,
        experience: true,
        skills: true,
        education: true,
        projects: false,
        certifications: false
    });

    const API_BASE_URL = 'http://localhost:5000';

    // Templates
    const templates = [
        { id: 'modern', name: 'Modern', preview: '🎨', color: '#3B82F6' },
        { id: 'classic', name: 'Classic', preview: '📄', color: '#6B7280' },
        { id: 'creative', name: 'Creative', preview: '🎭', color: '#8B5CF6' },
        { id: 'minimalist', name: 'Minimalist', preview: '✨', color: '#10B981' },
        { id: 'simple', name: 'Custom Layout', preview: '🎯', color: '#F59E0B' }
    ];

    // Colors for theme customization
    const themeColors = [
        '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
        '#EF4444', '#06B6D4', '#84CC16', '#F97316'
    ];

    const getFileUrl = (path) => {
        if (!path) return null;
        return `${API_BASE_URL}${path}`;
    };

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate('/login');
            return;
        }
        setIsLoggedIn(true);
        fetchCVProfile();
    }, [navigate]);

    const fetchCVProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/viewcvprofile`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                // Transform old format to new structure if needed
                if (data.skills && typeof data.skills === 'string') {
                    setCvProfile(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            summary: data.description || '',
                        },
                        skills: data.skills.split(',').map(skill => skill.trim()),
                        experience: data.experience ? [{ title: '', company: '', description: data.experience }] : [],
                        education: data.education ? [{ degree: '', school: '', description: data.education }] : [],
                        certifications: data.certifications ? data.certifications.split(',').map(cert => cert.trim()) : [],
                        avatar: data.avatar
                    }));
                } else {
                    setCvProfile(prev => ({ ...prev, ...data }));
                }
            }
        } catch (error) {
            console.error('Error fetching CV profile:', error);
            setError('Failed to load CV profile');
        }
    };

    // Add/Remove dynamic fields
    const addField = (section, defaultItem) => {
        setCvProfile(prev => ({
            ...prev,
            [section]: [...prev[section], defaultItem]
        }));
    };

    const removeField = (section, index) => {
        setCvProfile(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const updateField = (section, index, field, value) => {
        setCvProfile(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const updatePersonalInfo = (field, value) => {
        setCvProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCvProfile(prev => ({
                ...prev,
                avatar: URL.createObjectURL(file),
                avatarFile: file
            }));
        }
    };

    // Sidebar navigation
    const sidebarSections = [
        { id: 'personal', label: 'Personal Info', icon: FiUser },
        { id: 'experience', label: 'Experience', icon: FiBriefcase },
        { id: 'education', label: 'Education', icon: FiBook },
        { id: 'skills', label: 'Skills', icon: FiStar },
        { id: 'projects', label: 'Projects', icon: FiAward },
        { id: 'certifications', label: 'Certifications', icon: FiAward },
        { id: 'template', label: 'Template', icon: FiSettings },
        { id: 'layout', label: 'Section Layout', icon: FiGrid }
    ];

    // Simple section configuration
    const sectionConfig = {
        personalInfo: { title: 'Personal Information', icon: FiUser, required: true },
        summary: { title: 'Professional Summary', icon: FiFileText, required: false },
        experience: { title: 'Work Experience', icon: FiBriefcase, required: false },
        skills: { title: 'Skills', icon: FiStar, required: false },
        education: { title: 'Education', icon: FiBook, required: false },
        projects: { title: 'Projects', icon: FiAward, required: false },
        certifications: { title: 'Certifications', icon: FiAward, required: false }
    };

    // CV Preview Component
    const CVPreview = () => (
        <div id="cv-preview-element" className={`cv-preview ${selectedTemplate}`} 
             style={{ 
                 '--primary-color': cvProfile.theme.primaryColor,
                 '--font-family': cvProfile.theme.fontFamily || 'Inter',
                 '--layout-style': cvProfile.theme.layout || 'modern'
             }}>
             
            {/* Dynamic Section Rendering based on sectionOrder */}
            {selectedTemplate === 'simple' && (
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {sectionOrder.map((sectionId) => {
                        if (!sectionVisibility[sectionId]) return null;
                        
                        switch (sectionId) {
                            case 'personalInfo':
                                return (
                                    <div key={sectionId} className="flex items-center mb-8 pb-6 border-b-2" style={{ borderColor: cvProfile.theme.primaryColor }}>
                                        {cvProfile.avatar && cvProfile.theme.showPhoto !== false && (
                                            <img src={cvProfile.avatar} alt="Profile" 
                                                 className="w-24 h-24 rounded-full object-cover mr-6 border-4" 
                                                 style={{ borderColor: cvProfile.theme.primaryColor }} />
                                        )}
                                        <div className="flex-1">
                                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                                {cvProfile.personalInfo.fullName || 'Your Name'}
                                            </h1>
                                            <div className="flex flex-wrap gap-4 text-gray-600">
                                                {cvProfile.personalInfo.email && (
                                                    <div className="flex items-center">
                                                        {cvProfile.theme.showIcons !== false && <FiMail className="mr-2 text-blue-500" size={16} />}
                                                        {cvProfile.personalInfo.email}
                                                    </div>
                                                )}
                                                {cvProfile.personalInfo.phone && (
                                                    <div className="flex items-center">
                                                        {cvProfile.theme.showIcons !== false && <FiPhone className="mr-2 text-green-500" size={16} />}
                                                        {cvProfile.personalInfo.phone}
                                                    </div>
                                                )}
                                                {cvProfile.personalInfo.location && (
                                                    <div className="flex items-center">
                                                        {cvProfile.theme.showIcons !== false && <FiMapPin className="mr-2 text-red-500" size={16} />}
                                                        {cvProfile.personalInfo.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                                
                            case 'summary':
                                return cvProfile.personalInfo.summary && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Professional Summary
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">{cvProfile.personalInfo.summary}</p>
                                    </div>
                                );
                                
                            case 'experience':
                                return cvProfile.experience.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Experience
                                        </h2>
                                        {cvProfile.experience.map((exp, index) => (
                                            <div key={index} className="mb-6 last:mb-0 relative pl-6">
                                                <div className="absolute left-0 top-2 w-3 h-3 bg-blue-600 rounded-full"></div>
                                                <div className="absolute left-1.5 top-5 w-0.5 h-full bg-blue-200"></div>
                                                <div className="bg-gray-50 rounded-lg p-4 ml-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-semibold text-gray-800">{exp.title}</h3>
                                                        <span className="text-blue-600 font-medium text-sm bg-blue-100 px-3 py-1 rounded-full">{exp.duration}</span>
                                                    </div>
                                                    <p className="text-blue-600 font-medium mb-3">{exp.company}</p>
                                                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                                
                            case 'skills':
                                return cvProfile.skills.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: cvProfile.theme.primaryColor }}>
                                            Skills
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {cvProfile.skills.map((skill, index) => (
                                                <span key={index} 
                                                      className="px-3 py-1 rounded-full text-white text-sm font-medium"
                                                      style={{ backgroundColor: cvProfile.theme.primaryColor }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                                
                            case 'education':
                                return cvProfile.education.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: cvProfile.theme.primaryColor }}>
                                            Education
                                        </h2>
                                        {cvProfile.education.map((edu, index) => (
                                            <div key={index} className="mb-4 last:mb-0">
                                                <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                                                <p className="text-gray-600">{edu.school}</p>
                                                <p className="text-gray-500 text-sm">{edu.year}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                                
                            case 'projects':
                                return cvProfile.projects && cvProfile.projects.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: cvProfile.theme.primaryColor }}>
                                            Projects
                                        </h2>
                                        {cvProfile.projects.map((project, index) => (
                                            <div key={index} className="mb-4 last:mb-0">
                                                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                                                <p className="text-gray-600">{project.description}</p>
                                                <p className="text-gray-500 text-sm">{project.technologies}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                                
                            case 'certifications':
                                return cvProfile.certifications && cvProfile.certifications.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: cvProfile.theme.primaryColor }}>
                                            Certifications
                                        </h2>
                                        <div className="space-y-2">
                                            {cvProfile.certifications.map((cert, index) => (
                                                <div key={index} className="text-gray-700">
                                                    • {cert}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                                
                            default:
                                return null;
                        }
                    })}
                </div>
            )}
            
            {/* Modern Template */}
            {selectedTemplate === 'modern' && (
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header with gradient background */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative flex items-center">
                            {cvProfile.avatar && (
                                <img src={cvProfile.avatar} alt="Profile" 
                                     className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mr-6" />
                            )}
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold mb-2">
                                    {cvProfile.personalInfo.fullName || 'Your Name'}
                                </h1>
                                <div className="space-y-1 text-blue-100">
                                    {cvProfile.personalInfo.email && (
                                        <div className="flex items-center">
                                            <FiMail className="mr-2" size={16} />
                                            {cvProfile.personalInfo.email}
                                        </div>
                                    )}
                                    {cvProfile.personalInfo.phone && (
                                        <div className="flex items-center">
                                            <FiPhone className="mr-2" size={16} />
                                            {cvProfile.personalInfo.phone}
                                        </div>
                                    )}
                                    {cvProfile.personalInfo.location && (
                                        <div className="flex items-center">
                                            <FiMapPin className="mr-2" size={16} />
                                            {cvProfile.personalInfo.location}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8">
                        {/* Summary */}
                        {cvProfile.personalInfo.summary && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                    Professional Summary
                                </h2>
                                <p className="text-gray-700 leading-relaxed text-lg">{cvProfile.personalInfo.summary}</p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="col-span-2 space-y-8">
                                {/* Experience */}
                                {cvProfile.experience.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Experience
                                        </h2>
                                        {cvProfile.experience.map((exp, index) => (
                                            <div key={index} className="mb-6 last:mb-0 relative pl-6">
                                                <div className="absolute left-0 top-2 w-3 h-3 bg-blue-600 rounded-full"></div>
                                                <div className="absolute left-1.5 top-5 w-0.5 h-full bg-blue-200"></div>
                                                <div className="bg-gray-50 rounded-lg p-4 ml-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-semibold text-gray-800">{exp.title}</h3>
                                                        <span className="text-blue-600 font-medium text-sm bg-blue-100 px-3 py-1 rounded-full">{exp.duration}</span>
                                                    </div>
                                                    <p className="text-blue-600 font-medium mb-3">{exp.company}</p>
                                                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-8">
                                {/* Skills */}
                                {cvProfile.skills.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Skills
                                        </h2>
                                        <div className="space-y-2">
                                            {cvProfile.skills.map((skill, index) => (
                                                <div key={index} className="flex items-center">
                                                    <span className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium w-full text-center">
                                                        {skill}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Education */}
                                {cvProfile.education.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Education
                                        </h2>
                                        {cvProfile.education.map((edu, index) => (
                                            <div key={index} className="mb-4 last:mb-0 bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                                                <p className="text-blue-600 font-medium">{edu.school}</p>
                                                <p className="text-gray-500 text-sm">{edu.year}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Projects */}
                                {cvProfile.projects.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Projects
                                        </h2>
                                        {cvProfile.projects.map((project, index) => (
                                            <div key={index} className="mb-4 last:mb-0">
                                                <h3 className="font-semibold text-gray-800">{project.name}</h3>
                                                <p className="text-gray-600">{project.description}</p>
                                                <p className="text-gray-500 text-sm">{project.technologies}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Certifications */}
                                {cvProfile.certifications.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Certifications
                                        </h2>
                                        <div className="space-y-2">
                                            {cvProfile.certifications.map((cert, index) => (
                                                <div key={index} className="text-gray-700">• {cert}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Classic Template */}
            {selectedTemplate === 'classic' && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="text-center border-b-2 border-gray-800 p-8 bg-gray-50">
                        {cvProfile.avatar && (
                            <img src={cvProfile.avatar} alt="Profile" 
                                 className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-800" />
                        )}
                        <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
                            {cvProfile.personalInfo.fullName || 'Your Name'}
                        </h1>
                        <div className="flex justify-center space-x-6 text-gray-600">
                            {cvProfile.personalInfo.email && (
                                <span>{cvProfile.personalInfo.email}</span>
                            )}
                            {cvProfile.personalInfo.phone && (
                                <span>{cvProfile.personalInfo.phone}</span>
                            )}
                            {cvProfile.personalInfo.location && (
                                <span>{cvProfile.personalInfo.location}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        {/* Summary */}
                        {cvProfile.personalInfo.summary && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                    PROFESSIONAL SUMMARY
                                </h2>
                                <p className="text-gray-700 leading-relaxed">{cvProfile.personalInfo.summary}</p>
                            </div>
                        )}
                        
                        {/* Experience */}
                        {cvProfile.experience.length > 0 && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                    EXPERIENCE
                                </h2>
                                {cvProfile.experience.map((exp, index) => (
                                    <div key={index} className="mb-6 last:mb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">{exp.title}</h3>
                                            <span className="text-gray-600">{exp.duration}</span>
                                        </div>
                                        <p className="text-gray-700 font-medium mb-2 italic">{exp.company}</p>
                                        <p className="text-gray-600">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-8">
                            {/* Skills */}
                            {cvProfile.skills.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                        SKILLS
                                    </h2>
                                    <div className="space-y-1">
                                        {cvProfile.skills.map((skill, index) => (
                                            <div key={index} className="text-gray-700">
                                                • {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Education */}
                            {cvProfile.education.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                        EDUCATION
                                    </h2>
                                    {cvProfile.education.map((edu, index) => (
                                        <div key={index} className="mb-4 last:mb-0">
                                            <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                                            <p className="text-gray-700">{edu.school}</p>
                                            <p className="text-gray-600 text-sm">{edu.year}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Projects */}
                        {cvProfile.projects.length > 0 && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                    PROJECTS
                                </h2>
                                {cvProfile.projects.map((project, index) => (
                                    <div key={index} className="mb-4 last:mb-0">
                                        <h3 className="font-semibold text-gray-800">{project.name}</h3>
                                        <p className="text-gray-700">{project.description}</p>
                                        <p className="text-gray-600 text-sm italic">{project.technologies}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {cvProfile.certifications.length > 0 && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                    CERTIFICATIONS
                                </h2>
                                <div className="space-y-1">
                                    {cvProfile.certifications.map((cert, index) => (
                                        <div key={index} className="text-gray-700">• {cert}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Creative Template */}
            {selectedTemplate === 'creative' && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-3">
                        {/* Left Sidebar */}
                        <div className="bg-gradient-to-b from-purple-600 to-pink-600 text-white p-8">
                            {cvProfile.avatar && (
                                <img src={cvProfile.avatar} alt="Profile" 
                                     className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-lg" />
                            )}
                            
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold mb-4">
                                    {cvProfile.personalInfo.fullName || 'Your Name'}
                                </h1>
                                <div className="space-y-2 text-purple-100">
                                    {cvProfile.personalInfo.email && (
                                        <div className="flex items-center justify-center">
                                            <FiMail className="mr-2" size={14} />
                                            <span className="text-sm">{cvProfile.personalInfo.email}</span>
                                        </div>
                                    )}
                                    {cvProfile.personalInfo.phone && (
                                        <div className="flex items-center justify-center">
                                            <FiPhone className="mr-2" size={14} />
                                            <span className="text-sm">{cvProfile.personalInfo.phone}</span>
                                        </div>
                                    )}
                                    {cvProfile.personalInfo.location && (
                                        <div className="flex items-center justify-center">
                                            <FiMapPin className="mr-2" size={14} />
                                            <span className="text-sm">{cvProfile.personalInfo.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Skills in sidebar */}
                            {cvProfile.skills.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-bold mb-4 border-b border-purple-300 pb-2">
                                        Skills
                                    </h2>
                                    <div className="space-y-3">
                                        {cvProfile.skills.map((skill, index) => (
                                            <div key={index} className="bg-white bg-opacity-20 rounded-lg p-2 text-center text-sm">
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Education in sidebar */}
                            {cvProfile.education.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-bold mb-4 border-b border-purple-300 pb-2">
                                        Education
                                    </h2>
                                    {cvProfile.education.map((edu, index) => (
                                        <div key={index} className="mb-4 last:mb-0">
                                            <h3 className="font-semibold text-sm">{edu.degree}</h3>
                                            <p className="text-purple-100 text-xs">{edu.school}</p>
                                            <p className="text-purple-200 text-xs">{edu.year}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Main Content */}
                        <div className="col-span-2 p-8">
                            {/* Summary */}
                            {cvProfile.personalInfo.summary && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                        About Me
                                    </h2>
                                    <div className="bg-white rounded-lg p-6 shadow-md">
                                        <p className="text-gray-700 leading-relaxed">{cvProfile.personalInfo.summary}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Experience */}
                            {cvProfile.experience.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                        Experience
                                    </h2>
                                    {cvProfile.experience.map((exp, index) => (
                                        <div key={index} className="mb-6 last:mb-0">
                                            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-xl font-semibold text-gray-800">{exp.title}</h3>
                                                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                        {exp.duration}
                                                    </span>
                                                </div>
                                                <p className="text-purple-600 font-medium mb-3">{exp.company}</p>
                                                <p className="text-gray-700">{exp.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Projects */}
                            {cvProfile.projects.length > 0 && (
                                <div className="mt-10">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                        Projects
                                    </h2>
                                    {cvProfile.projects.map((project, index) => (
                                        <div key={index} className="mb-6 last:mb-0">
                                            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-pink-500">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h3>
                                                <p className="text-gray-700 mb-1">{project.description}</p>
                                                <p className="text-gray-500 text-sm italic">{project.technologies}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Certifications */}
                            {cvProfile.certifications.length > 0 && (
                                <div className="mt-10">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                        Certifications
                                    </h2>
                                    <div className="space-y-2">
                                        {cvProfile.certifications.map((cert, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                                                {cert}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Minimalist Template */}
            {selectedTemplate === 'minimalist' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="border-b border-gray-100 p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {cvProfile.avatar && (
                                    <img src={cvProfile.avatar} alt="Profile" 
                                         className="w-20 h-20 rounded-full object-cover mr-6 border-2 border-gray-200" />
                                )}
                                <div>
                                    <h1 className="text-3xl font-light text-gray-900 mb-2">
                                        {cvProfile.personalInfo.fullName || 'Your Name'}
                                    </h1>
                                    <div className="flex space-x-4 text-gray-600 text-sm">
                                        {cvProfile.personalInfo.email && (
                                            <span>{cvProfile.personalInfo.email}</span>
                                        )}
                                        {cvProfile.personalInfo.phone && (
                                            <span>{cvProfile.personalInfo.phone}</span>
                                        )}
                                        {cvProfile.personalInfo.location && (
                                            <span>{cvProfile.personalInfo.location}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-12">
                        {/* Summary */}
                        {cvProfile.personalInfo.summary && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                    Summary
                                </h2>
                                <p className="text-gray-700 leading-relaxed">{cvProfile.personalInfo.summary}</p>
                            </div>
                        )}
                        
                        {/* Experience */}
                        {cvProfile.experience.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-6 uppercase tracking-wide">
                                    Experience
                                </h2>
                                <div className="space-y-8">
                                    {cvProfile.experience.map((exp, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-medium text-gray-900">{exp.title}</h3>
                                                <span className="text-gray-500 text-sm">{exp.duration}</span>
                                            </div>
                                            <p className="text-green-600 font-medium mb-3">{exp.company}</p>
                                            <p className="text-gray-600 leading-relaxed">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-12">
                            {/* Skills */}
                            {cvProfile.skills.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                        Skills
                                    </h2>
                                    <div className="space-y-2">
                                        {cvProfile.skills.map((skill, index) => (
                                            <div key={index} className="text-gray-700">
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Education */}
                            {cvProfile.education.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                        Education
                                    </h2>
                                    <div className="space-y-4">
                                        {cvProfile.education.map((edu, index) => (
                                            <div key={index}>
                                                <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                                                <p className="text-gray-700">{edu.school}</p>
                                                <p className="text-gray-500 text-sm">{edu.year}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Projects */}
                        {cvProfile.projects.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                    Projects
                                </h2>
                                <div className="space-y-6">
                                    {cvProfile.projects.map((project, index) => (
                                        <div key={index}>
                                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                            <p className="text-gray-600">{project.description}</p>
                                            <p className="text-gray-500 text-sm italic">{project.technologies}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {cvProfile.certifications.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                    Certifications
                                </h2>
                                <div className="space-y-2">
                                    {cvProfile.certifications.map((cert, index) => (
                                        <div key={index} className="text-gray-700">• {cert}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // Import Zone Component
    const ImportZone = () => (
        <div className="mb-12">
            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50 ${
                    isDragActive 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                        : 'border-gray-300 hover:border-blue-400 hover:shadow-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50'
                }`}
            >
                <input {...getInputProps()} />
                <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FiUpload className="text-white" size={32} />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Import Existing CV</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    {isDragActive 
                        ? 'Drop your CV file here...' 
                        : 'Drag & drop a PDF or DOCX file, or click to browse'
                    }
                </p>
                <div className="flex justify-center items-center space-x-4 text-sm">
                    <span className="text-gray-500 font-medium">Supported formats:</span>
                    <div className="flex space-x-2">
                        <span className="bg-red-100 text-red-700 px-3 py-2 rounded-xl font-semibold border border-red-200">PDF</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl font-semibold border border-blue-200">DOCX</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Validation Errors Component
    const ValidationErrors = () => {
        if (validationErrors.length === 0) return null;
        
        return (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center mb-2">
                    <FiAlertCircle className="text-red-500 mr-2" />
                    <h4 className="text-red-800 font-semibold">Please fix these issues:</h4>
                </div>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </div>
        );
    };

    // Enhanced Action Buttons
    const ActionButtons = () => (
        <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
                onClick={() => setShowPreviewModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                <FiEye className="mr-2" />
                Live Preview
            </button>
            
            <button 
                onClick={() => handleDownloadPDF()}
                disabled={isGeneratingPDF}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                {isGeneratingPDF ? (
                    <FiLoader className="mr-2 animate-spin" />
                ) : (
                    <FiDownload className="mr-2" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>
            
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all flex items-center font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                {isSaving ? (
                    <FiLoader className="mr-2 animate-spin" />
                ) : (
                    <FiSave className="mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <label className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <input 
                    type="checkbox" 
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-500" 
                />
                <span>Auto-save</span>
            </label>
        </div>
    );

    // Preview Modal Component
    const PreviewModal = () => {
        if (!showPreviewModal) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowPreviewModal(false)}
            >
                <div
                    className="relative bg-white rounded-lg p-8 max-w-4xl w-full shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                >
                    {/* Close button */}
                    <button
                        onClick={() => setShowPreviewModal(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <FiX size={20} />
                    </button>

                    <h2 className="text-2xl font-bold mb-6">CV Preview</h2>
                    <CVPreview />
                </div>
            </div>
        );
    };

    const renderProjectsSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Projects</h3>
                <button
                    onClick={() => addField('projects', { name: '', technologies: '', description: '' })}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                    <FiPlus className="mr-2" /> Add Project
                </button>
            </div>

            {cvProfile.projects.map((project, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800">Project {index + 1}</h4>
                        <button
                            onClick={() => removeField('projects', index)}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Project Name"
                            value={project.name}
                            onChange={(e) => updateField('projects', index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Technologies (e.g., React, Node.js)"
                            value={project.technologies}
                            onChange={(e) => updateField('projects', index, 'technologies', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                                        
                    <textarea
                        placeholder="Project description..."
                        value={project.description}
                        onChange={(e) => updateField('projects', index, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            ))}
        </div>
    );

    const renderCertificationsSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Certifications</h3>
                <button
                    onClick={() => setCvProfile(prev => ({ ...prev, certifications: [...prev.certifications, ''] }))}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                    <FiPlus className="mr-2" /> Add Certification
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cvProfile.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Certification name"
                            value={cert}
                            onChange={(e) => {
                                const newCerts = [...cvProfile.certifications];
                                newCerts[index] = e.target.value;
                                setCvProfile(prev => ({ ...prev, certifications: newCerts }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => {
                                const newCerts = cvProfile.certifications.filter((_, i) => i !== index);
                                setCvProfile(prev => ({ ...prev, certifications: newCerts }));
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTemplateSection = () => (
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-gray-800">Customize Template & Appearance</h3>
            
            {/* Template Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Choose Template Style</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                                selectedTemplate === template.id 
                                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <div className="text-3xl mb-3">{template.preview}</div>
                            <div className="text-sm font-semibold text-gray-800">{template.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {template.id === 'modern' && 'Gradient header, timeline'}
                                {template.id === 'classic' && 'Traditional, clean'}
                                {template.id === 'creative' && 'Colorful sidebar design'}
                                {template.id === 'minimalist' && 'Clean, simple layout'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Customization */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Primary Color Theme</label>
                <div className="flex flex-wrap gap-3 mb-4">
                    {themeColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setCvProfile(prev => ({ 
                                ...prev, 
                                theme: { ...prev.theme, primaryColor: color } 
                            }))}
                            className={`w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110 ${
                                cvProfile.theme.primaryColor === color 
                                    ? 'border-gray-800 scale-110 shadow-lg' 
                                    : 'border-gray-300 hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                
                {/* Custom Color Picker */}
                <div className="flex items-center space-x-4">
                    <label className="text-sm text-gray-600">Custom Color:</label>
                    <input
                        type="color"
                        value={cvProfile.theme.primaryColor}
                        onChange={(e) => setCvProfile(prev => ({ 
                            ...prev, 
                            theme: { ...prev.theme, primaryColor: e.target.value } 
                        }))}
                        className="w-12 h-8 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 font-mono">{cvProfile.theme.primaryColor}</span>
                </div>
            </div>
            
            {/* Font Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Font Family</label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { name: 'Inter', value: 'Inter, sans-serif', preview: 'Aa' },
                        { name: 'Roboto', value: 'Roboto, sans-serif', preview: 'Aa' },
                        { name: 'Open Sans', value: 'Open Sans, sans-serif', preview: 'Aa' },
                        { name: 'Lato', value: 'Lato, sans-serif', preview: 'Aa' },
                        { name: 'Poppins', value: 'Poppins, sans-serif', preview: 'Aa' },
                        { name: 'Playfair', value: 'Playfair Display, serif', preview: 'Aa' },
                    ].map((font) => (
                        <button
                            key={font.value}
                            onClick={() => setCvProfile(prev => ({ 
                                ...prev, 
                                theme: { ...prev.theme, fontFamily: font.value } 
                            }))}
                            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                                cvProfile.theme.fontFamily === font.value
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ fontFamily: font.value }}
                        >
                            <span className="text-sm font-medium">{font.name}</span>
                            <span className="text-lg">{font.preview}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Layout Options */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Layout Settings</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Spacing */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Content Spacing</label>
                        <select 
                            value={cvProfile.theme.spacing || 'normal'}
                            onChange={(e) => setCvProfile(prev => ({ 
                                ...prev, 
                                theme: { ...prev.theme, spacing: e.target.value } 
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="compact">Compact</option>
                            <option value="normal">Normal</option>
                            <option value="spacious">Spacious</option>
                        </select>
                    </div>
                    
                    {/* Border Radius */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Corner Roundness</label>
                        <select 
                            value={cvProfile.theme.borderRadius || 'normal'}
                            onChange={(e) => setCvProfile(prev => ({ 
                                ...prev, 
                                theme: { ...prev.theme, borderRadius: e.target.value } 
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="sharp">Sharp (0px)</option>
                            <option value="normal">Normal (8px)</option>
                            <option value="rounded">Rounded (16px)</option>
                            <option value="extra-rounded">Extra Rounded (24px)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Advanced Options */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <FiSettings className="mr-2" />
                    Advanced Styling
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Show Icons */}
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={cvProfile.theme.showIcons !== false}
                            onChange={(e) => setCvProfile(prev => ({ 
                                ...prev, 
                                theme: { ...prev.theme, showIcons: e.target.checked } 
                            }))}
                            className="rounded text-blue-500 focus:ring-blue-500" 
                        />
                        <span className="text-sm text-gray-700">Show contact icons</span>
                    </label>
                    
                    {/* Show Profile Photo */}
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={cvProfile.theme.showPhoto !== false}
                            onChange={(e) => setCvProfile(prev => ({ 
                                ...prev, 
                                theme: { ...prev.theme, showPhoto: e.target.checked } 
                            }))}
                            className="rounded text-blue-500 focus:ring-blue-500" 
                        />
                        <span className="text-sm text-gray-700">Show profile photo</span>
                    </label>
                    
                    {/* Accent Color */}
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={cvProfile.theme.useAccentColor !== false}
                            onChange={(e) => setCvProfile(prev => ({ 
                                ...prev, 
                                theme: { ...prev.theme, useAccentColor: e.target.checked } 
                            }))}
                            className="rounded text-blue-500 focus:ring-blue-500" 
                        />
                        <span className="text-sm text-gray-700">Use accent colors</span>
                    </label>
                    
                    {/* Two Column Layout */}
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={cvProfile.theme.twoColumn === true}
                            onChange={(e) => setCvProfile(prev => ({ 
                                ...prev, 
                                theme: { ...prev.theme, twoColumn: e.target.checked } 
                            }))}
                            className="rounded text-blue-500 focus:ring-blue-500" 
                        />
                        <span className="text-sm text-gray-700">Two-column layout</span>
                    </label>
                </div>
            </div>
            
            {/* Preview Actions */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-4">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowPreviewModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center text-sm font-medium"
                    >
                        <FiEye className="mr-2" size={16} />
                        Preview Changes
                    </button>
                    
                    <button
                        onClick={() => setCvProfile(prev => ({ 
                            ...prev, 
                            theme: { 
                                primaryColor: '#3B82F6', 
                                fontFamily: 'Inter, sans-serif',
                                spacing: 'normal',
                                borderRadius: 'normal',
                                showIcons: true,
                                showPhoto: true,
                                useAccentColor: true,
                                twoColumn: false
                            } 
                        }))}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all flex items-center text-sm font-medium"
                    >
                        Reset to Default
                    </button>
                </div>
            </div>
        </div>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'personal': return renderPersonalSection();
            case 'experience': return renderExperienceSection();
            case 'education': return renderEducationSection();
            case 'skills': return renderSkillsSection();
            case 'projects': return renderProjectsSection();
            case 'certifications': return renderCertificationsSection();
            case 'template': return renderTemplateSection();
            case 'layout': return renderLayoutSection();
            default: return renderPersonalSection();
        }
    };

    // Auto-save functionality
    useEffect(() => {
        if (autoSave && cvProfile.personalInfo.fullName) {
            const timeoutId = setTimeout(() => {
                CVStorage.save(cvProfile);
            }, 2000); // Save after 2 seconds of inactivity
            
            return () => clearTimeout(timeoutId);
        }
    }, [cvProfile, autoSave]);

    // Load saved data on mount
    useEffect(() => {
        const savedData = CVStorage.load();
        if (savedData) {
            setCvProfile(prev => ({ ...prev, ...savedData }));
        }
    }, []);

    // File drop functionality (simplified)
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setMessage('File upload not yet implemented in this simplified version.');
        
        // For now, just show a message that this feature needs backend support
        setTimeout(() => {
            setMessage('');
        }, 3000);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false
    });

    // Enhanced save functionality
    const handleSave = async () => {
        setIsSaving(true);
        const errors = CVValidator.validateCV(cvProfile);
        setValidationErrors(errors);

        if (errors.length > 0) {
            setError('Please fix validation errors before saving');
            setIsSaving(false);
            return;
        }

        try {
            // Save to local storage
            CVStorage.save(cvProfile);
            
            // Save to server (existing API)
            const formData = new FormData();
            formData.append('skills', cvProfile.skills.join(', '));
            formData.append('experience', JSON.stringify(cvProfile.experience));
            formData.append('description', cvProfile.personalInfo.summary);
            formData.append('education', JSON.stringify(cvProfile.education));
            formData.append('certifications', cvProfile.certifications.join(', '));
            
            if (cvProfile.avatarFile) {
                formData.append('avatarFile', cvProfile.avatarFile);
            }

            const response = await fetch(`${API_BASE_URL}/api/updatecvprofile`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                setMessage('CV saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                throw new Error('Failed to save to server');
            }
        } catch (error) {
            setError(`Save failed: ${error.message}`);
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // Enhanced PDF generation
    const handleDownloadPDF = async (method = 'html') => {
        setIsGeneratingPDF(true);
        
        try {
            // Simple PDF generation using jsPDF and html2canvas
            const elementId = 'cv-preview-element';
            const element = document.getElementById(elementId);
            
            if (!element) {
                throw new Error('CV preview element not found. Please try opening the preview first.');
            }

            // Make sure the element is visible for capture
            const parentElement = element.parentElement;
            let wasHidden = false;
            if (parentElement && parentElement.classList.contains('hidden')) {
                parentElement.classList.remove('hidden');
                parentElement.style.position = 'absolute';
                parentElement.style.left = '-9999px';
                parentElement.style.top = '-9999px';
                wasHidden = true;
            }

            // Apply temporary PDF-optimized styles
            const tempStyle = document.createElement('style');
            tempStyle.textContent = `
                #${elementId} { 
                    transform: none !important;
                    width: 794px !important; /* A4 width in pixels at 96 DPI */
                    padding: 0 !important;
                    margin: 0 !important;
                    background: white !important;
                    box-shadow: none !important;
                    border: none !important;
                    max-width: none !important;
                    font-size: 12px !important;
                }
                #${elementId} .max-w-7xl, #${elementId} .max-w-4xl, #${elementId} .mx-auto { 
                    margin: 0 !important; 
                    max-width: 100% !important; 
                    width: 100% !important;
                }
                #${elementId} .rounded-2xl, #${elementId} .rounded-lg, #${elementId} .rounded { 
                    border-radius: 0 !important; 
                }
                #${elementId} .shadow, #${elementId} .shadow-lg, #${elementId} .shadow-xl, #${elementId} .shadow-sm { 
                    box-shadow: none !important; 
                }
                #${elementId} .border, #${elementId} .border-gray-100, #${elementId} .border-gray-200 { 
                    border: none !important; 
                }
                #${elementId} .p-8 { padding: 16px !important; }
                #${elementId} .px-8 { padding-left: 16px !important; padding-right: 16px !important; }
                #${elementId} .py-8 { padding-top: 16px !important; padding-bottom: 16px !important; }
                #${elementId} .gap-8 { gap: 12px !important; }
                #${elementId} .space-y-8 > * + * { margin-top: 12px !important; }
                #${elementId} .mb-8 { margin-bottom: 12px !important; }
                #${elementId} .text-4xl { font-size: 22px !important; line-height: 1.2 !important; }
                #${elementId} .text-3xl { font-size: 18px !important; line-height: 1.2 !important; }
                #${elementId} .text-2xl { font-size: 16px !important; line-height: 1.3 !important; }
                #${elementId} .text-xl { font-size: 14px !important; line-height: 1.3 !important; }
                #${elementId} .text-lg { font-size: 13px !important; line-height: 1.4 !important; }
                #${elementId} p, #${elementId} span, #${elementId} div { font-size: 11px !important; line-height: 1.4 !important; }
                #${elementId} .text-sm { font-size: 10px !important; line-height: 1.4 !important; }
                #${elementId} .text-xs { font-size: 9px !important; line-height: 1.3 !important; }
                #${elementId} .grid-cols-3 { display: flex !important; flex-direction: row !important; }
                #${elementId} .col-span-2 { flex: 2 !important; }
                #${elementId} .col-span-1 { flex: 1 !important; }
            `;
            document.head.appendChild(tempStyle);
            
            // Wait for styles to apply
            await new Promise(resolve => setTimeout(resolve, 200));

            // Generate canvas with better settings for text clarity
            const canvas = await html2canvas(element, {
                scale: 1.5, // Reduced scale for better performance while maintaining quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794, // Fixed A4 width
                height: element.scrollHeight, // Use scroll height to capture full content
                windowWidth: 794,
                windowHeight: element.scrollHeight,
                logging: false,
                imageTimeout: 10000,
                removeContainer: true
            });

            // Remove temporary styles
            document.head.removeChild(tempStyle);

            // Restore hidden state
            if (wasHidden) {
                parentElement.classList.add('hidden');
                parentElement.style.position = '';
                parentElement.style.left = '';
                parentElement.style.top = '';
            }

            // Create PDF with no margins
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
            
            const imgWidth = canvas.width / 1.5; // Adjust for scale
            const imgHeight = canvas.height / 1.5;
            
            // Calculate dimensions to fill the entire page width (no margins)
            let finalWidth = pdfWidth; // Use full page width
            let finalHeight = (imgHeight / imgWidth) * pdfWidth;

            // If height exceeds page, fit to page height and adjust width proportionally
            if (finalHeight > pdfHeight) {
                finalHeight = pdfHeight;
                finalWidth = (imgWidth / imgHeight) * pdfHeight;
            }

            // Center the image if it doesn't fill full width
            const imgX = (pdfWidth - finalWidth) / 2;
            const imgY = 0; // Start from top

            const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG with high quality for better file size
            pdf.addImage(imgData, 'JPEG', imgX, imgY, finalWidth, finalHeight);
            
            // If content is taller than one page, handle multiple pages
            if (finalHeight > pdfHeight) {
                let remainingHeight = finalHeight - pdfHeight;
                let currentY = -pdfHeight;
                
                while (remainingHeight > 0) {
                    pdf.addPage();
                    const pageHeight = Math.min(remainingHeight, pdfHeight);
                    pdf.addImage(imgData, 'JPEG', imgX, currentY, finalWidth, finalHeight);
                    currentY -= pdfHeight;
                    remainingHeight -= pdfHeight;
                }
            }
            
            pdf.save(`${cvProfile.personalInfo.fullName || 'CV'}.pdf`);
            
            setMessage('CV downloaded successfully!');
        } catch (error) {
            console.error('PDF generation error:', error);
            setError(`PDF generation failed: ${error.message}`);
        } finally {
            setIsGeneratingPDF(false);
            setTimeout(() => {
                setMessage('');
                setError('');
            }, 3000);
        }
    };

    // Section Layout Manager
    const renderLayoutSection = () => (
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-gray-800">Manage CV Section Layout</h3>
            <p className="text-gray-600">Drag and drop to reorder sections, or toggle their visibility</p>
            
            {/* Section Order Management */}
            <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <FiMenu className="mr-2" />
                    Section Order
                </h4>
                
                <Droppable droppableId="sections">
                    {(provided) => (
                        <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                            className="space-y-3"
                        >
                            {sectionOrder.map((sectionId, index) => {
                                const section = sectionConfig[sectionId];
                                if (!section) return null;
                                
                                const Icon = section.icon;
                                
                                return (
                                    <Draggable 
                                        key={sectionId} 
                                        draggableId={sectionId} 
                                        index={index}
                                        isDragDisabled={section.required}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={provided.draggableProps.style}
                                                className={`p-4 bg-white border-2 rounded-xl ${
                                                    snapshot.isDragging 
                                                        ? 'border-blue-500 shadow-lg' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div 
                                                            {...provided.dragHandleProps}
                                                            className="p-2 text-gray-400 hover:text-gray-600 cursor-grab mr-3"
                                                        >
                                                            <FiMenu size={18} />
                                                        </div>
                                                        <Icon className="mr-3 text-blue-600" size={20} />
                                                        <div>
                                                            <h5 className="font-semibold text-gray-800">{section.title}</h5>
                                                            <p className="text-sm text-gray-500">
                                                                {section.required ? 'Required section' : 'Optional section'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-3">
                                                        {!section.required && (
                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={sectionVisibility[sectionId]}
                                                                    onChange={() => toggleSectionVisibility(sectionId)}
                                                                    className="rounded text-blue-500 focus:ring-blue-500" 
                                                                />
                                                                <span className="text-sm text-gray-600">Visible</span>
                                                            </label>
                                                        )}
                                                        {section.required && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                                Required
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
            
            {/* Layout Presets */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Layout Presets</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setSectionOrder(['personalInfo', 'summary', 'experience', 'skills', 'education', 'projects', 'certifications'])}
                        className="p-4 bg-white border border-gray-300 rounded-xl hover:border-blue-500 transition-all text-left"
                    >
                        <h5 className="font-semibold text-gray-800 mb-2">👔 Professional</h5>
                        <p className="text-sm text-gray-600">Standard business layout</p>
                    </button>
                    
                    <button
                        onClick={() => setSectionOrder(['personalInfo', 'skills', 'experience', 'projects', 'education', 'certifications', 'summary'])}
                        className="p-4 bg-white border border-gray-300 rounded-xl hover:border-blue-500 transition-all text-left"
                    >
                        <h5 className="font-semibold text-gray-800 mb-2">💻 Tech Focus</h5>
                        <p className="text-sm text-gray-600">Skills and projects first</p>
                    </button>
                    
                    <button
                        onClick={() => setSectionOrder(['personalInfo', 'summary', 'education', 'experience', 'skills', 'certifications', 'projects'])}
                        className="p-4 bg-white border border-gray-300 rounded-xl hover:border-blue-500 transition-all text-left"
                    >
                        <h5 className="font-semibold text-gray-800 mb-2">🎓 Academic</h5>
                        <p className="text-sm text-gray-600">Education-focused layout</p>
                    </button>
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-4">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowPreviewModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center text-sm font-medium"
                    >
                        <FiEye className="mr-2" size={16} />
                        Preview Layout
                    </button>
                    
                    <button
                        onClick={() => {
                            setSectionOrder(['personalInfo', 'summary', 'experience', 'skills', 'education', 'projects', 'certifications']);
                            setSectionVisibility({
                                personalInfo: true,
                                summary: true,
                                experience: true,
                                skills: true,
                                education: true,
                                projects: false,
                                certifications: false
                            });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all flex items-center text-sm font-medium"
                    >
                        Reset Layout
                    </button>
                </div>
            </div>
        </div>
    );

    // Drag and drop handler
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const newSectionOrder = Array.from(sectionOrder);
        const [reorderedItem] = newSectionOrder.splice(result.source.index, 1);
        newSectionOrder.splice(result.destination.index, 0, reorderedItem);
        
        setSectionOrder(newSectionOrder);
    };

    // Toggle section visibility
    const toggleSectionVisibility = (sectionId) => {
        setSectionVisibility(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // ----------------------------------------
    // Form Rendering Functions
    // ----------------------------------------

    const renderPersonalSection = () => (
        <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center space-x-6">
                {cvProfile.avatar ? (
                    <img
                        src={cvProfile.avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                    />
                ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        <FiUser size={32} />
                    </div>
                )}
                <div>
                    <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors inline-block">
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        Upload Photo
                    </label>
                </div>
            </div>

            {/* Personal Info Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={cvProfile.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={cvProfile.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Phone"
                    value={cvProfile.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={cvProfile.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={cvProfile.personalInfo.linkedIn}
                    onChange={(e) => updatePersonalInfo('linkedIn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Github URL"
                    value={cvProfile.personalInfo.github}
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Summary */}
            <textarea
                placeholder="Professional summary..."
                value={cvProfile.personalInfo.summary}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );

    const renderExperienceSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Work Experience</h3>
                <button
                    onClick={() => addField('experience', { title: '', company: '', duration: '', description: '' })}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                    <FiPlus className="mr-2" /> Add Experience
                </button>
            </div>

            {cvProfile.experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800">Position {index + 1}</h4>
                        <button
                            onClick={() => removeField('experience', index)}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => updateField('experience', index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateField('experience', index, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Duration (e.g., 2020 - 2023)"
                            value={exp.duration}
                            onChange={(e) => updateField('experience', index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <textarea
                        placeholder="Job description..."
                        value={exp.description}
                        onChange={(e) => updateField('experience', index, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            ))}
        </div>
    );

    const renderEducationSection = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Education</h3>
                <button
                    onClick={() => addField('education', { degree: '', school: '', year: '', description: '' })}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                    <FiPlus className="mr-2" /> Add Education
                </button>
            </div>

            {cvProfile.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800">Education {index + 1}</h4>
                        <button
                            onClick={() => removeField('education', index)}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateField('education', index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="School"
                            value={edu.school}
                            onChange={(e) => updateField('education', index, 'school', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Year (e.g., 2023)"
                            value={edu.year}
                            onChange={(e) => updateField('education', index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <textarea
                        placeholder="Additional details..."
                        value={edu.description}
                        onChange={(e) => updateField('education', index, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            ))}
        </div>
    );

    const renderSkillsSection = () => {
        const addSkill = () => {
            if (!newSkillInput.trim()) return;
            setCvProfile(prev => ({ ...prev, skills: [...prev.skills, newSkillInput.trim()] }));
            setNewSkillInput('');
        };

        const removeSkill = (index) => {
            setCvProfile(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Add a skill"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={addSkill}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <FiPlus />
                    </button>
                </div>

                {cvProfile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {cvProfile.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center space-x-1 text-sm"
                            >
                                <span>{skill}</span>
                                <FiTrash2
                                    size={12}
                                    className="cursor-pointer"
                                    onClick={() => removeSkill(index)}
                                />
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {BanPopup}
            <Header />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            CV Builder <span className="text-blue-500">Studio</span>
                        </h1>
                        <p className="text-xl text-gray-600">Create a professional CV that stands out</p>
                    </div>

                    {/* Action Buttons */}
                    <ImportZone />
                    <ValidationErrors />
                    <ActionButtons />

                    {/* Beautiful 2-Column Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-8 border border-gray-100">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <FiEdit3 className="text-white" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">CV Builder</h3>
                                    <p className="text-sm text-gray-500">Customize your sections</p>
                                </div>
                                
                                <nav className="space-y-3">
                                    {sidebarSections.map((section) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group ${
                                                    activeSection === section.id 
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-xl mr-3 transition-all ${
                                                    activeSection === section.id 
                                                        ? 'bg-white bg-opacity-20' 
                                                        : 'bg-gray-100 group-hover:bg-blue-100'
                                                }`}>
                                                    <Icon size={18} />
                                                </div>
                                                <span className="font-medium">{section.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                                
                                {/* Quick Stats */}
                                <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Progress</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-600">Completion</span>
                                            <span className="font-medium text-blue-600">
                                                {Math.round(((cvProfile.personalInfo.fullName ? 1 : 0) + 
                                                (cvProfile.skills.length > 0 ? 1 : 0) + 
                                                (cvProfile.experience.length > 0 ? 1 : 0) + 
                                                (cvProfile.education.length > 0 ? 1 : 0)) / 4 * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                                style={{ 
                                                    width: `${Math.round(((cvProfile.personalInfo.fullName ? 1 : 0) + 
                                                    (cvProfile.skills.length > 0 ? 1 : 0) + 
                                                    (cvProfile.experience.length > 0 ? 1 : 0) + 
                                                    (cvProfile.education.length > 0 ? 1 : 0)) / 4 * 100)}%` 
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="xl:col-span-3">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                    {/* Section Header */}
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-100">
                                        <div className="flex items-center">
                                            {(() => {
                                                const currentSection = sidebarSections.find(s => s.id === activeSection);
                                                const Icon = currentSection?.icon || FiUser;
                                                return (
                                                    <>
                                                        <div className="p-3 bg-white rounded-2xl shadow-md mr-4">
                                                            <Icon className="text-blue-600" size={24} />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-2xl font-bold text-gray-800">
                                                                {currentSection?.label || 'Personal Info'}
                                                            </h2>
                                                            <p className="text-gray-600">
                                                                {activeSection === 'personal' && 'Basic information and contact details'}
                                                                {activeSection === 'experience' && 'Your work history and achievements'}
                                                                {activeSection === 'education' && 'Educational background and qualifications'}
                                                                {activeSection === 'skills' && 'Technical and soft skills'}
                                                                {activeSection === 'projects' && 'Notable projects and portfolio'}
                                                                {activeSection === 'certifications' && 'Certificates and credentials'}
                                                                {activeSection === 'template' && 'Customize appearance and theme'}
                                                            </p>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    
                                    {/* Form Content */}
                                    <div className="p-8">
                                        {renderActiveSection()}
                                    </div>
                                </div>
                            </DragDropContext>
                        </div>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg">
                            {error}
                        </div>
                    )}

                    {/* Hidden CV Preview for PDF Generation */}
                    <div className="hidden">
                        <div id="cv-preview-element">
                            <CVPreview />
                        </div>
                    </div>
                </div>
            </div>

            <PreviewModal />

            <style jsx>{`
                .cv-preview {
                    font-family: var(--font-family, 'Inter'), -apple-system, BlinkMacSystemFont, sans-serif;
                    line-height: 1.6;
                    font-size: 14px; /* Base font size for PDF */
                    max-width: 210mm; /* A4 width */
                    margin: 0 auto;
                }
                
                /* PDF-specific optimizations */
                .cv-preview h1 { font-size: 28px !important; }
                .cv-preview h2 { font-size: 20px !important; }
                .cv-preview h3 { font-size: 16px !important; }
                .cv-preview h4 { font-size: 14px !important; }
                .cv-preview p, .cv-preview span, .cv-preview div { font-size: 13px !important; }
                .cv-preview .text-lg { font-size: 15px !important; }
                .cv-preview .text-xl { font-size: 17px !important; }
                .cv-preview .text-2xl { font-size: 20px !important; }
                .cv-preview .text-3xl { font-size: 24px !important; }
                .cv-preview .text-4xl { font-size: 28px !important; }
                .cv-preview .text-sm { font-size: 12px !important; }
                .cv-preview .text-xs { font-size: 11px !important; }
                
                .cv-preview.modern {
                    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
                }
                .cv-preview.classic {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                }
                .cv-preview.creative {
                    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%);
                }
                .cv-preview.minimalist {
                    background: #ffffff;
                    box-shadow: none;
                    border: 1px solid #f3f4f6;
                }
                
                /* Template-specific font optimizations */
                .cv-preview.modern h1 { font-size: 32px !important; }
                .cv-preview.classic h1 { font-size: 28px !important; }
                .cv-preview.creative h1 { font-size: 24px !important; }
                .cv-preview.minimalist h1 { font-size: 30px !important; }
                
                /* Print-friendly styles */
                @media print {
                    .cv-preview { 
                        font-size: 12px; 
                        max-width: 100%; 
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </>
    );
};

export default CVProfile;