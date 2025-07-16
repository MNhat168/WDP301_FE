import React from 'react';
import {
    FiMail, FiPhone, FiMapPin, FiUser, FiBriefcase,
    FiBook, FiStar, FiAward, FiGlobe
} from 'react-icons/fi';

const CVPreview = ({ cvData, template = 'modern' }) => {
    // Helper functions
    const getSkillName = (skill) => {
        if (typeof skill === 'string') return skill;
        if (skill?.skillName) return skill.skillName;
        if (skill?.name) return skill.name;
        return String(skill);
    };

    const getSkillDisplay = (skill) => {
        const name = getSkillName(skill);
        if (skill?.level && skill.yearsOfExperience !== undefined) {
            return `${name} (${skill.level}, ${skill.yearsOfExperience}y)`;
        }
        return name;
    };

    // Normalize CV data structure
    const personalInfo = cvData?.personalInfo || {
        fullName: cvData?.fullName || '',
        email: cvData?.email || '',
        phone: cvData?.phone || '',
        location: cvData?.location || '',
        linkedIn: cvData?.linkedIn || '',
        github: cvData?.github || '',
        portfolio: cvData?.portfolio || '',
        summary: cvData?.summary || '',
        description: cvData?.description || ''
    };

    const skills = cvData?.skills || [];
    const experience = cvData?.experience || cvData?.workExperience || [];
    const education = cvData?.education || [];
    const certifications = cvData?.certifications || [];
    const projects = cvData?.projects || [];
    const languages = cvData?.languages || [];
    const avatar = cvData?.avatar || cvData?.profilePhoto || null;
    const theme = cvData?.theme || {
        primaryColor: '#3B82F6',
        fontFamily: 'Inter',
        layout: 'modern'
    };

    // Default section config for "simple" template
    const sectionOrder = cvData?.sectionOrder || [
        'personalInfo',
        'summary', 
        'experience',
        'skills',
        'education',
        'projects',
        'certifications'
    ];
    
    const sectionVisibility = cvData?.sectionVisibility || {
        personalInfo: true,
        summary: true,
        experience: true,
        skills: true,
        education: true,
        projects: false,
        certifications: false
    };

    return (
        <div className="cv-preview"
            style={{
                '--primary-color': theme.primaryColor,
                '--font-family': theme.fontFamily,
                '--layout-style': theme.layout
            }}>
            {template === 'simple' && (
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {sectionOrder.map((sectionId) => {
                        if (!sectionVisibility[sectionId]) return null;

                        switch (sectionId) {
                            case 'personalInfo':
                                return (
                                    <div key={sectionId} className="flex items-center mb-8 pb-6 border-b-2" style={{ borderColor: theme.primaryColor }}>
                                        {avatar && theme.showPhoto !== false && (
                                            <img src={avatar} alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover mr-6 border-4"
                                                style={{ borderColor: theme.primaryColor }} />
                                        )}
                                        <div className="flex-1">
                                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                                {personalInfo.fullName || 'Your Name'}
                                            </h1>
                                            <div className="flex flex-wrap gap-4 text-gray-600">
                                                {personalInfo.email && (
                                                    <div className="flex items-center">
                                                        {theme.showIcons !== false && <FiMail className="mr-2 text-blue-500" size={16} />}
                                                        {personalInfo.email}
                                                    </div>
                                                )}
                                                {personalInfo.phone && (
                                                    <div className="flex items-center">
                                                        {theme.showIcons !== false && <FiPhone className="mr-2 text-green-500" size={16} />}
                                                        {personalInfo.phone}
                                                    </div>
                                                )}
                                                {personalInfo.location && (
                                                    <div className="flex items-center">
                                                        {theme.showIcons !== false && <FiMapPin className="mr-2 text-red-500" size={16} />}
                                                        {personalInfo.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );

                            case 'summary':
                                return personalInfo.summary && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Professional Summary
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
                                    </div>
                                );

                            case 'experience':
                                return experience.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Experience
                                        </h2>
                                        {experience.map((exp, index) => (
                                            <div key={index} className="mb-6 last:mb-0 relative pl-6">
                                                <div className="absolute left-0 top-2 w-3 h-3 bg-blue-600 rounded-full"></div>
                                                <div className="absolute left-1.5 top-5 w-0.5 h-full bg-blue-200"></div>
                                                <div className="bg-gray-50 rounded-lg p-4 ml-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-semibold text-gray-800">{exp.position || exp.title}</h3>
                                                        <span className="text-blue-600 font-medium text-sm bg-blue-100 px-3 py-1 rounded-full">
                                                            {exp.duration || (exp.startDate && exp.endDate ?
                                                                `${new Date(exp.startDate).getFullYear()} - ${exp.isCurrent ? 'Present' : new Date(exp.endDate).getFullYear()}` :
                                                                (exp.startDate ? `${new Date(exp.startDate).getFullYear()} - Present` : ''))}
                                                        </span>
                                                    </div>
                                                    <p className="text-blue-600 font-medium mb-3">{exp.company}</p>
                                                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );

                            case 'skills':
                                return skills.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: theme.primaryColor }}>
                                            Skills
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill, index) => (
                                                <span key={index}
                                                    className="px-3 py-1 rounded-full text-white text-sm font-medium"
                                                    style={{ backgroundColor: theme.primaryColor }}>
                                                    {getSkillName(skill)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );

                            case 'education':
                                return education.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: theme.primaryColor }}>
                                            Education
                                        </h2>
                                        {education.map((edu, index) => (
                                            <div key={index} className="mb-4 last:mb-0 bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                                                <p className="text-blue-600 font-medium">{edu.institution || edu.school}</p>
                                                <p className="text-gray-500 text-sm">
                                                    {edu.year || (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                                                    {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                                                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                );

                            case 'projects':
                                return projects && projects.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: theme.primaryColor }}>
                                            Projects
                                        </h2>
                                        {projects.map((project, index) => (
                                            <div key={index} className="mb-4 last:mb-0">
                                                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                                                <p className="text-gray-600">{project.description}</p>
                                                <p className="text-gray-500 text-sm">{project.technologies}</p>
                                            </div>
                                        ))}
                                    </div>
                                );

                            case 'certifications':
                                return certifications && certifications.length > 0 && (
                                    <div key={sectionId} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800" style={{ color: theme.primaryColor }}>
                                            Certifications
                                        </h2>
                                        <div className="space-y-2">
                                            {certifications.map((cert, index) => (
                                                <div key={index} className="text-gray-700">
                                                    • {cert.name || cert}
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
            {template === 'modern' && (
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header with gradient background */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative flex items-center">
                            {avatar && (
                                <img src={avatar} alt="Profile"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mr-6" />
                            )}
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold mb-2">
                                    {personalInfo.fullName || 'Your Name'}
                                </h1>
                                <div className="space-y-1 text-blue-100">
                                    {personalInfo.email && (
                                        <div className="flex items-center">
                                            <FiMail className="mr-2" size={16} />
                                            {personalInfo.email}
                                        </div>
                                    )}
                                    {personalInfo.phone && (
                                        <div className="flex items-center">
                                            <FiPhone className="mr-2" size={16} />
                                            {personalInfo.phone}
                                        </div>
                                    )}
                                    {personalInfo.location && (
                                        <div className="flex items-center">
                                            <FiMapPin className="mr-2" size={16} />
                                            {personalInfo.location}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Summary */}
                        {personalInfo.summary && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                    Professional Summary
                                </h2>
                                <p className="text-gray-700 leading-relaxed text-lg">{personalInfo.summary}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="col-span-2 space-y-8">
                                {/* Experience */}
                                {experience.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Experience
                                        </h2>
                                        {experience.map((exp, index) => (
                                            <div key={index} className="mb-6 last:mb-0 relative pl-6">
                                                <div className="absolute left-0 top-2 w-3 h-3 bg-blue-600 rounded-full"></div>
                                                <div className="absolute left-1.5 top-5 w-0.5 h-full bg-blue-200"></div>
                                                <div className="bg-gray-50 rounded-lg p-4 ml-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-semibold text-gray-800">{exp.position || exp.title}</h3>
                                                        <span className="text-blue-600 font-medium text-sm bg-blue-100 px-3 py-1 rounded-full">
                                                            {exp.duration || (exp.startDate && exp.endDate ?
                                                                `${new Date(exp.startDate).getFullYear()} - ${exp.isCurrent ? 'Present' : new Date(exp.endDate).getFullYear()}` :
                                                                (exp.startDate ? `${new Date(exp.startDate).getFullYear()} - Present` : ''))}
                                                        </span>
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
                                {skills.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Skills
                                        </h2>
                                        <div className="space-y-2">
                                            {skills.map((skill, index) => (
                                                <div key={index} className="flex items-center">
                                                    <span className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium w-full text-center">
                                                        {getSkillName(skill)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {education.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Education
                                        </h2>
                                        {education.map((edu, index) => (
                                            <div key={index} className="mb-4 last:mb-0 bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                                                <p className="text-blue-600 font-medium">{edu.institution || edu.school}</p>
                                                <p className="text-gray-500 text-sm">
                                                    {edu.year || (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                                                    {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                                                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Projects */}
                                {projects.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Projects
                                        </h2>
                                        {projects.map((project, index) => (
                                            <div key={index} className="mb-4 last:mb-0">
                                                <h3 className="font-semibold text-gray-800">{project.name}</h3>
                                                <p className="text-gray-600">{project.description}</p>
                                                <p className="text-gray-500 text-sm">{project.technologies}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Certifications */}
                                {certifications.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
                                            Certifications
                                        </h2>
                                        <div className="space-y-2">
                                            {certifications.map((cert, index) => (
                                                <div key={index} className="text-gray-700">• {cert.name || cert}</div>
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
            {template === 'classic' && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="text-center border-b-2 border-gray-800 p-8 bg-gray-50">
                        {avatar && (
                            <img src={avatar} alt="Profile"
                                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-800" />
                        )}
                        <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
                            {personalInfo.fullName || 'Your Name'}
                        </h1>
                        <div className="flex justify-center space-x-6 text-gray-600">
                            {personalInfo.email && (
                                <span>{personalInfo.email}</span>
                            )}
                            {personalInfo.phone && (
                                <span>{personalInfo.phone}</span>
                            )}
                            {personalInfo.location && (
                                <span>{personalInfo.location}</span>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Summary */}
                        {personalInfo.summary && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                    PROFESSIONAL SUMMARY
                                </h2>
                                <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
                            </div>
                        )}

                        {/* Experience */}
                        {experience.length > 0 && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                    EXPERIENCE
                                </h2>
                                {experience.map((exp, index) => (
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
                            {skills.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                        SKILLS
                                    </h2>
                                    <div className="space-y-1">
                                        {skills.map((skill, index) => (
                                            <div key={index} className="text-gray-700">
                                                {getSkillName(skill)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {education.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                        EDUCATION
                                    </h2>
                                    {education.map((edu, index) => (
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
                        {projects.length > 0 && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                    PROJECTS
                                </h2>
                                {projects.map((project, index) => (
                                    <div key={index} className="mb-4 last:mb-0">
                                        <h3 className="font-semibold text-gray-800">{project.name}</h3>
                                        <p className="text-gray-700">{project.description}</p>
                                        <p className="text-gray-600 text-sm italic">{project.technologies}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {certifications.length > 0 && (
                            <div>
                                <h2 className="text-xl font-serif font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                    CERTIFICATIONS
                                </h2>
                                <div className="space-y-1">
                                    {certifications.map((cert, index) => (
                                        <div key={index} className="text-gray-700">• {cert.name || cert}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Creative Template */}
            {template === 'creative' && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-3">
                        {/* Left Sidebar */}
                        <div className="bg-gradient-to-b from-purple-600 to-pink-600 text-white p-8">
                            {avatar && (
                                <img src={avatar} alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-lg" />
                            )}

                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold mb-4">
                                    {personalInfo.fullName || 'Your Name'}
                                </h1>
                                <div className="space-y-2 text-purple-100">
                                    {personalInfo.email && (
                                        <div className="flex items-center justify-center">
                                            <FiMail className="mr-2" size={14} />
                                            <span className="text-sm">{personalInfo.email}</span>
                                        </div>
                                    )}
                                    {personalInfo.phone && (
                                        <div className="flex items-center justify-center">
                                            <FiPhone className="mr-2" size={14} />
                                            <span className="text-sm">{personalInfo.phone}</span>
                                        </div>
                                    )}
                                    {personalInfo.location && (
                                        <div className="flex items-center justify-center">
                                            <FiMapPin className="mr-2" size={14} />
                                            <span className="text-sm">{personalInfo.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Skills in sidebar */}
                            {skills.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-bold mb-4 border-b border-purple-300 pb-2">
                                        Skills
                                    </h2>
                                    <div className="space-y-3">
                                        {skills.map((skill, index) => (
                                            <div key={index} className="bg-white bg-opacity-20 rounded-lg p-2 text-center text-sm">
                                                {getSkillName(skill)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education in sidebar */}
                            {education.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-bold mb-4 border-b border-purple-300 pb-2">
                                        Education
                                    </h2>
                                    {education.map((edu, index) => (
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
                            {personalInfo.summary && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                        About Me
                                    </h2>
                                    <div className="bg-white rounded-lg p-6 shadow-md">
                                        <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
                                    </div>
                                </div>
                            )}

                            {/* Experience */}
                            {experience.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                        Experience
                                    </h2>
                                    {experience.map((exp, index) => (
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
                            {projects.length > 0 && (
                                <div className="mt-10">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                        Projects
                                    </h2>
                                    {projects.map((project, index) => (
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
                            {certifications.length > 0 && (
                                <div className="mt-10">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                                        Certifications
                                    </h2>
                                    <div className="space-y-2">
                                        {certifications.map((cert, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                                                {cert.name || cert}
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
            {template === 'minimalist' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="border-b border-gray-100 p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {avatar && (
                                    <img src={avatar} alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover mr-6 border-2 border-gray-200" />
                                )}
                                <div>
                                    <h1 className="text-3xl font-light text-gray-900 mb-2">
                                        {personalInfo.fullName || 'Your Name'}
                                    </h1>
                                    <div className="flex space-x-4 text-gray-600 text-sm">
                                        {personalInfo.email && (
                                            <span>{personalInfo.email}</span>
                                        )}
                                        {personalInfo.phone && (
                                            <span>{personalInfo.phone}</span>
                                        )}
                                        {personalInfo.location && (
                                            <span>{personalInfo.location}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-12">
                        {/* Summary */}
                        {personalInfo.summary && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                    Summary
                                </h2>
                                <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
                            </div>
                        )}

                        {/* Experience */}
                        {experience.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-6 uppercase tracking-wide">
                                    Experience
                                </h2>
                                <div className="space-y-8">
                                    {experience.map((exp, index) => (
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
                            {skills.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                        Skills
                                    </h2>
                                    <div className="space-y-2">
                                        {skills.map((skill, index) => (
                                            <div key={index} className="text-gray-700">
                                                {getSkillName(skill)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {education.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                        Education
                                    </h2>
                                    <div className="space-y-4">
                                        {education.map((edu, index) => (
                                            <div key={index}>
                                                <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                                                <p className="text-gray-700">{edu.institution || edu.school}</p>
                                                <p className="text-gray-600 text-sm">
                                                    {edu.year || (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                                                    {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                                                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Projects */}
                        {projects.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                    Projects
                                </h2>
                                <div className="space-y-6">
                                    {projects.map((project, index) => (
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
                        {certifications.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                                    Certifications
                                </h2>
                                <div className="space-y-2">
                                    {certifications.map((cert, index) => (
                                        <div key={index} className="text-gray-700">• {cert.name || cert}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CVPreview;