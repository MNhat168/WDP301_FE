import React, { useState, useEffect, useContext } from 'react';
import { Plus, X, Upload, FileText, Trash2, Save, User, Briefcase, GraduationCap, Award, Languages, Phone, FileCheck } from 'lucide-react';
import { UserContext } from '../../../Context';
import Header from '../../layout/header';

const CVProfile = () => {
    const [cvProfile, setCvProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { user } = useContext(UserContext);
    const userId = user?.userData?._id;

    // Form data state
    const [formData, setFormData] = useState({
        description: '',
        phoneNumber: '',
        summary: '',
        workExperience: [],
        education: [],
        skills: [],
        languages: [],
        certifications: []
    });
    const API_BASE_URL = 'http://localhost:5000';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    const initializeCVProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cvs/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();
            if (data.success) {
                setCvProfile(data.data);
                setFormData({
                    description: data.data.description || '',
                    phoneNumber: data.data.phoneNumber || '',
                    summary: data.data.summary || '',
                    workExperience: data.data.workExperience || [],
                    education: data.data.education || [],
                    skills: data.data.skills || [],
                    languages: data.data.languages || [],
                    certifications: data.data.certifications || []
                });
                setMessage({ type: 'success', text: 'CV Profile initialized successfully' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Error initializing CV profile:', error);
            setMessage({ type: 'error', text: 'Failed to initialize CV profile' });
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCVProfile();
        }
    }, [userId]);

    const fetchCVProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cvs/user/${userId}`, {
                headers
            });
            const data = await response.json();

            if (data.success) {
                setCvProfile(data.data);
                setFormData({
                    description: data.data.description || '',
                    phoneNumber: data.data.phoneNumber || '',
                    summary: data.data.summary || '',
                    workExperience: data.data.workExperience || [],
                    education: data.data.education || [],
                    skills: data.data.skills || [],
                    languages: data.data.languages || [],
                    certifications: data.data.certifications || []
                });
            } else if (response.status === 404) {
                // CV Profile doesn't exist, initialize it
                await initializeCVProfile();
            }
        } catch (error) {
            console.error('Error fetching CV profile:', error);
            setMessage({ type: 'error', text: 'Failed to load CV profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayFieldChange = (section, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addArrayItem = (section, defaultItem) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], defaultItem]
        }));
    };

    const removeArrayItem = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/cvs/user/${userId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setCvProfile(data.data);
                setMessage({ type: 'success', text: 'CV Profile updated successfully' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Error updating CV profile:', error);
            setMessage({ type: 'error', text: 'Failed to update CV profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (certificationIndex, files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        const formDataUpload = new FormData();

        Array.from(files).forEach(file => {
            formDataUpload.append('certificationFiles', file);
        });

        formDataUpload.append('certificationIndex', certificationIndex);

        try {
            const response = await fetch(`${API_BASE_URL}/api/cvs/user/${userId}/certifications/upload`, {
                method: 'POST',
                body: formDataUpload
            });

            const data = await response.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    certifications: data.data
                }));
                setMessage({ type: 'success', text: 'Files uploaded successfully' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            setMessage({ type: 'error', text: 'Failed to upload files' });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (certificationId, filePublicId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cvs/user/${userId}/certifications/${certificationId}/files/${filePublicId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    certifications: data.data
                }));
                setMessage({ type: 'success', text: 'File deleted successfully' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            setMessage({ type: 'error', text: 'Failed to delete file' });
        }
    };

    const handleProficiencyChange = (index, level) => {
        const proficiencyLevels = ['basic', 'conversational', 'fluent', 'native'];
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.map((lang, i) =>
                i === index ? { ...lang, proficiency: proficiencyLevels[level] } : lang
            )
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <><Header /><div className="max-w-4xl mx-auto p-6 bg-white">
            {/* Header with progress info */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">CV Profile</h1>
                {cvProfile && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                            <FileCheck className="w-4 h-4 mr-1" />
                            {cvProfile.completionPercentage}% Complete
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${cvProfile.isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {cvProfile.isComplete ? 'Complete' : 'Incomplete'}
                        </span>
                    </div>
                )}
            </div>

            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="border-b pb-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            readOnly
                            value={user ? `${user.userData.firstName} ${user.userData.lastName}` : ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={user?.userData?.phone || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            placeholder="(123) 456 7890"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address & Email</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            readOnly
                            value={user?.userData?.city || ''}
                            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            placeholder="No city provided"
                        />
                        <input
                            type="email"
                            readOnly
                            value={user?.userData?.email || ''}
                            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2 space-y-10">
                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
                            SUMMARY
                        </h2>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Click or tap here to edit text. The summary section of your CV should be a brief summary of your experience, qualifications, and skills. It allows employers to quickly get to know about you and your suitability for the role." />
                    </section>

                    {/* Experience Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold flex items-center">
                                EXPERIENCE
                            </h2>
                            <button
                                type="button"
                                onClick={() => addArrayItem('workExperience', {
                                    company: '',
                                    position: '',
                                    startDate: '',
                                    endDate: '',
                                    description: '',
                                    isCurrent: false
                                })}
                                className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {formData.workExperience.map((exp, index) => (
                            <div key={index} className="mb-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-baseline gap-4">
                                        <h3 className="text-lg font-medium">
                                            <input
                                                type="text"
                                                placeholder="Job Title"
                                                value={exp.position || ''}
                                                onChange={(e) => handleArrayFieldChange('workExperience', index, 'position', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full max-w-xs" />
                                        </h3>
                                        <span className="text-gray-500 text-sm">
                                            <input
                                                type="text"
                                                placeholder="Jan 2023 - Jan 2023"
                                                value={exp.dates || ''}
                                                onChange={(e) => handleArrayFieldChange('workExperience', index, 'dates', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full max-w-xs" />
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('workExperience', index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-gray-600 text-sm">
                                        <input
                                            type="text"
                                            placeholder="Company, City"
                                            value={exp.company || ''}
                                            onChange={(e) => handleArrayFieldChange('workExperience', index, 'company', e.target.value)}
                                            className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full" />
                                    </span>
                                </div>

                                <textarea
                                    placeholder="Click or tap here to edit text. List jobs in order of most recent first. Include any relevant work experience or voluntary work."
                                    value={exp.description || ''}
                                    onChange={(e) => handleArrayFieldChange('workExperience', index, 'description', e.target.value)}
                                    rows={4}
                                    className="w-full px-0 py-2 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none" />

                                <div className="mt-2">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            <input
                                                type="text"
                                                placeholder="Include key achievements, tasks, and projects."
                                                value={exp.bullet1 || ''}
                                                onChange={(e) => handleArrayFieldChange('workExperience', index, 'bullet1', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full" />
                                        </li>
                                        <li>
                                            <input
                                                type="text"
                                                placeholder="Include important keywords taken from job advert."
                                                value={exp.bullet2 || ''}
                                                onChange={(e) => handleArrayFieldChange('workExperience', index, 'bullet2', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full" />
                                        </li>
                                        <li>
                                            <input
                                                type="text"
                                                placeholder="Include figures and statistics if you can."
                                                value={exp.bullet3 || ''}
                                                onChange={(e) => handleArrayFieldChange('workExperience', index, 'bullet3', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full" />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Education Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold flex items-center">
                                EDUCATION
                            </h2>
                            <button
                                type="button"
                                onClick={() => addArrayItem('education', {
                                    institution: '',
                                    degree: '',
                                    fieldOfStudy: '',
                                    startDate: '',
                                    endDate: '',
                                    gpa: ''
                                })}
                                className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {formData.education.map((edu, index) => (
                            <div key={index} className="mb-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-baseline gap-4">
                                        <h3 className="text-lg font-medium">
                                            <input
                                                type="text"
                                                placeholder="BSc Degree Title (2:1)"
                                                value={edu.degree || ''}
                                                onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full max-w-xs" />
                                        </h3>
                                        <span className="text-gray-500 text-sm">
                                            <input
                                                type="text"
                                                placeholder="Jan 2023 - Jan 2023"
                                                value={edu.dates || ''}
                                                onChange={(e) => handleArrayFieldChange('education', index, 'dates', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full max-w-xs" />
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('education', index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-gray-600 text-sm">
                                        <input
                                            type="text"
                                            placeholder="University Name, City"
                                            value={edu.institution || ''}
                                            onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                                            className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full" />
                                    </span>
                                </div>

                                <div className="mb-2">
                                    <span className="font-medium">Final year project: </span>
                                    <input
                                        type="text"
                                        placeholder="'Study and Analysis of Subject'"
                                        value={edu.project || ''}
                                        onChange={(e) => handleArrayFieldChange('education', index, 'project', e.target.value)}
                                        className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full" />
                                </div>

                                <textarea
                                    placeholder="Click or tap here to edit text. If a student or recent graduate you can place education section above experience. Include any relevant academic achievements, research, extracurricular activities, projects, or coursework."
                                    value={edu.description || ''}
                                    onChange={(e) => handleArrayFieldChange('education', index, 'description', e.target.value)}
                                    rows={3}
                                    className="w-full px-0 py-2 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none" />

                                <div className="mt-3">
                                    <div className="flex items-baseline gap-4">
                                        <h4 className="text-md font-medium">
                                            <input
                                                type="text"
                                                placeholder="GCSE and A Level"
                                                value={edu.secondary || ''}
                                                onChange={(e) => handleArrayFieldChange('education', index, 'secondary', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full max-w-xs" />
                                        </h4>
                                        <span className="text-gray-500 text-sm">
                                            <input
                                                type="text"
                                                placeholder="Jan 2023 - Jan 2023"
                                                value={edu.secondaryDates || ''}
                                                onChange={(e) => handleArrayFieldChange('education', index, 'secondaryDates', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full max-w-xs" />
                                        </span>
                                    </div>

                                    <div className="mt-1">
                                        <span className="text-gray-600 text-sm">
                                            <input
                                                type="text"
                                                placeholder="School Name, City"
                                                value={edu.school || ''}
                                                onChange={(e) => handleArrayFieldChange('education', index, 'school', e.target.value)}
                                                className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full" />
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="8 x GCSEs grade C or above, including Maths and English."
                                            value={edu.grades || ''}
                                            onChange={(e) => handleArrayFieldChange('education', index, 'grades', e.target.value)}
                                            className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                {/* Right Column */}
                <div className="md:col-span-1 space-y-6">
                    {/* Skills Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold">SKILLS</h2>
                            <button
                                type="button"
                                onClick={() => addArrayItem('skills', {
                                    skillName: '',
                                    level: 'beginner',
                                    yearsOfExperience: ''
                                })}
                                className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.skills.map((skill, index) => (
                                <div key={index} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('skills', index)}
                                        className="text-red-600 hover:text-red-800 mr-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Skill Name"
                                        value={skill.skillName || ''}
                                        onChange={(e) => handleArrayFieldChange('skills', index, 'skillName', e.target.value)}
                                        className="px-3 py-1 border-b border-dashed bg-gray-100 rounded-full focus:border-blue-500 focus:outline-none" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Languages Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold flex items-center">
                                LANGUAGES
                            </h2>
                            <button
                                type="button"
                                onClick={() => addArrayItem('languages', {
                                    language: '',
                                    proficiency: 'basic'
                                })}
                                className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {formData.languages.map((lang, index) => (
                            <div key={index} className="mb-6 p-3 border rounded-lg">
                                <div className="flex items-center mb-3">
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('languages', index)}
                                        className="text-red-600 hover:text-red-800 mr-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Language"
                                        value={lang.language || ''}
                                        onChange={(e) => handleArrayFieldChange('languages', index, 'language', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>

                                {/* Proficiency Progress Bar */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>Basic</span>
                                        <span>Conversational</span>
                                        <span>Fluent</span>
                                        <span>Native</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{
                                                width: lang.proficiency === 'basic' ? '25%' :
                                                    lang.proficiency === 'conversational' ? '50%' :
                                                        lang.proficiency === 'fluent' ? '75%' : '100%'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        {[0, 1, 2, 3].map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => handleProficiencyChange(index, level)}
                                                className={`w-6 h-6 rounded-full border-2 ${(lang.proficiency === 'basic' && level === 0) ||
                                                    (lang.proficiency === 'conversational' && level === 1) ||
                                                    (lang.proficiency === 'fluent' && level === 2) ||
                                                    (lang.proficiency === 'native' && level === 3)
                                                    ? 'border-blue-600 bg-blue-100'
                                                    : 'border-gray-300 bg-white'}`}
                                            >
                                                {level + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-center text-sm font-medium">
                                        {lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Certifications Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold flex items-center">
                                CERTIFICATIONS
                            </h2>
                            <button
                                type="button"
                                onClick={() => addArrayItem('certifications', {
                                    name: '',
                                    issuer: '',
                                    issueDate: '',
                                    expiryDate: '',
                                    credentialId: '',
                                    files: []
                                })}
                                className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {formData.certifications.map((cert, index) => (
                            <div key={index} className="mb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <input
                                        type="text"
                                        placeholder="Certification Name"
                                        value={cert.name || ''}
                                        onChange={(e) => handleArrayFieldChange('certifications', index, 'name', e.target.value)}
                                        className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none w-full font-medium" />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('certifications', index)}
                                        className="text-red-600 hover:text-red-800 ml-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Issuer: </span>
                                        <input
                                            type="text"
                                            placeholder="Issuing Organization"
                                            value={cert.issuer || ''}
                                            onChange={(e) => handleArrayFieldChange('certifications', index, 'issuer', e.target.value)}
                                            className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none" />
                                    </div>

                                    <div>
                                        <span className="text-gray-600">Date: </span>
                                        <input
                                            type="text"
                                            placeholder="Jan 2023"
                                            value={cert.issueDate || ''}
                                            onChange={(e) => handleArrayFieldChange('certifications', index, 'issueDate', e.target.value)}
                                            className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none" />
                                    </div>

                                    <div>
                                        <span className="text-gray-600">ID: </span>
                                        <input
                                            type="text"
                                            placeholder="Credential ID"
                                            value={cert.credentialId || ''}
                                            onChange={(e) => handleArrayFieldChange('certifications', index, 'credentialId', e.target.value)}
                                            className="px-0 py-1 border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none" />
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-medium text-gray-700">Certification Files</h4>
                                        <label className="flex items-center px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer text-sm">
                                            <Upload className="w-3 h-3 mr-1" />
                                            Upload PDF
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf"
                                                onChange={(e) => handleFileUpload(index, e.target.files)}
                                                className="hidden" />
                                        </label>
                                    </div>

                                    {/* Display uploaded files */}
                                    {cert.files && cert.files.length > 0 && (
                                        <div className="space-y-2">
                                            {cert.files.map((file, fileIndex) => (
                                                <div key={fileIndex} className="flex items-center justify-between bg-gray-100 p-2 rounded text-sm">
                                                    <div className="flex items-center">
                                                        <FileText className="w-4 h-4 mr-2 text-red-600" />
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            View Certificate
                                                        </a>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteFile(cert._id, file.public_id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save CV Profile'}
                </button>
            </div>
        </div></>
    );
};

export default CVProfile;