import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// PDF Generation Utilities
export class CVPDFGenerator {
    
    // Method 1: HTML to PDF using jsPDF + html2canvas (High Quality)
    static async generateFromHTML(elementId, filename = 'cv.pdf') {
        try {
            console.log('Looking for element with ID:', elementId);
            const element = document.getElementById(elementId);
            console.log('Found element:', element);
            
            if (!element) {
                // Log all available elements with IDs for debugging
                const allElements = document.querySelectorAll('[id]');
                console.log('Available elements with IDs:', Array.from(allElements).map(el => el.id));
                throw new Error('CV element not found');
            }
            
            // Check if element is visible
            const rect = element.getBoundingClientRect();
            console.log('Element dimensions:', rect);
            
            // If element is hidden (like our fallback element), temporarily make it visible
            let wasHidden = false;
            if (rect.width === 0 || rect.height === 0) {
                const parentElement = element.parentElement;
                if (parentElement && parentElement.classList.contains('hidden')) {
                    parentElement.classList.remove('hidden');
                    parentElement.style.position = 'absolute';
                    parentElement.style.left = '-9999px';
                    parentElement.style.top = '-9999px';
                    wasHidden = true;
                }
            }

            // Configure html2canvas for high quality
            const canvas = await html2canvas(element, {
                scale: 1.5, // Balanced resolution for better text size
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.offsetHeight,
                windowWidth: 1200, // Fixed window width for consistent sizing
                windowHeight: 1600, // Fixed window height
                logging: false,
                imageTimeout: 15000
            });
            
            // Restore hidden state if it was hidden
            if (wasHidden) {
                const parentElement = element.parentElement;
                parentElement.classList.add('hidden');
                parentElement.style.position = '';
                parentElement.style.left = '';
                parentElement.style.top = '';
            }

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate proper dimensions to maintain text size
            const imgWidth = canvas.width / 1.5; // Adjust for scale
            const imgHeight = canvas.height / 1.5;
            
            // Fit to full page width (remove left/right margins)
            let finalWidth = pdfWidth;
            let finalHeight = (imgHeight / imgWidth) * pdfWidth;

            // If after width-fit the height exceeds page, scale down to fit height
            if (finalHeight > pdfHeight) {
                const heightRatio = pdfHeight / finalHeight;
                finalWidth = finalWidth * heightRatio;
                finalHeight = pdfHeight; // exact fit height
            }

            const imgX = (pdfWidth - finalWidth) / 2; // may be 0 if width == page
            const imgY = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
            pdf.save(filename);
            
            return { success: true, message: 'CV downloaded successfully!' };
        } catch (error) {
            console.error('PDF generation error:', error);
            return { success: false, error: error.message };
        }
    }

    // Method 2: React-PDF for programmatic PDF creation
    static createReactPDF(cvData) {
        const primaryColor = cvData.theme?.primaryColor || '#3B82F6';
        
        const styles = StyleSheet.create({
            page: {
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                padding: 0,
                fontSize: 11,
                fontFamily: 'Helvetica',
                lineHeight: 1.4
            },
            // Header section with gradient-like effect
            header: {
                backgroundColor: primaryColor,
                color: 'white',
                padding: 25,
                marginBottom: 0
            },
            headerContent: {
                flexDirection: 'row',
                alignItems: 'center'
            },
            avatarPlaceholder: {
                width: 60,
                height: 60,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 30,
                marginRight: 20,
                border: '3px solid rgba(255,255,255,0.3)'
            },
            headerText: {
                flex: 1
            },
            name: {
                fontSize: 28,
                fontWeight: 'bold',
                marginBottom: 8,
                color: 'white'
            },
            contactRow: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 15
            },
            contact: {
                fontSize: 11,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 3
            },
            // Main content area
            content: {
                padding: 25,
                paddingTop: 30
            },
            // Two column layout for some sections
            twoColumn: {
                flexDirection: 'row',
                gap: 30,
                marginBottom: 20
            },
            leftColumn: {
                flex: 2
            },
            rightColumn: {
                flex: 1
            },
            section: {
                marginBottom: 25
            },
            sectionTitle: {
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 12,
                color: primaryColor,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                borderBottomWidth: 2,
                borderBottomColor: primaryColor,
                paddingBottom: 5
            },
            // Experience styling
            experienceItem: {
                marginBottom: 18,
                paddingLeft: 15,
                borderLeftWidth: 3,
                borderLeftColor: primaryColor,
                paddingBottom: 15
            },
            jobTitle: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#1F2937',
                marginBottom: 4
            },
            companyInfo: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
            },
            company: {
                fontSize: 12,
                color: primaryColor,
                fontWeight: 'bold'
            },
            duration: {
                fontSize: 10,
                color: '#6B7280',
                backgroundColor: '#F3F4F6',
                padding: '4 8',
                borderRadius: 12
            },
            description: {
                fontSize: 11,
                lineHeight: 1.5,
                color: '#4B5563'
            },
            // Skills styling
            skillsContainer: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8
            },
            skillTag: {
                backgroundColor: primaryColor,
                color: 'white',
                padding: '6 12',
                borderRadius: 15,
                fontSize: 10,
                fontWeight: 'bold'
            },
            // Education styling
            educationItem: {
                marginBottom: 12,
                padding: 12,
                backgroundColor: '#F9FAFB',
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: primaryColor
            },
            degree: {
                fontSize: 13,
                fontWeight: 'bold',
                color: '#1F2937',
                marginBottom: 3
            },
            school: {
                fontSize: 11,
                color: primaryColor,
                marginBottom: 2
            },
            year: {
                fontSize: 10,
                color: '#6B7280'
            },
            // Projects styling
            projectItem: {
                marginBottom: 15,
                padding: 12,
                backgroundColor: '#FEFEFE',
                border: '1px solid #E5E7EB',
                borderRadius: 8
            },
            projectName: {
                fontSize: 13,
                fontWeight: 'bold',
                color: '#1F2937',
                marginBottom: 4
            },
            technologies: {
                fontSize: 9,
                color: '#8B5CF6',
                marginBottom: 6,
                fontStyle: 'italic'
            },
            projectDesc: {
                fontSize: 10,
                color: '#4B5563',
                lineHeight: 1.4
            },
            // Certifications
            certItem: {
                fontSize: 11,
                color: '#1F2937',
                marginBottom: 6,
                paddingLeft: 10,
                position: 'relative'
            },
            bullet: {
                position: 'absolute',
                left: 0,
                color: primaryColor,
                fontWeight: 'bold'
            },
            // Summary section
            summary: {
                fontSize: 11,
                lineHeight: 1.6,
                color: '#374151',
                padding: 15,
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: primaryColor
            }
        });

        const CVDocument = () => (
            <Document>
                <Page size="A4" style={styles.page}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.avatarPlaceholder} />
                            <View style={styles.headerText}>
                                <Text style={styles.name}>
                                    {cvData.personalInfo?.fullName || 'Your Name'}
                                </Text>
                                <View style={styles.contactRow}>
                                    {cvData.personalInfo?.email && (
                                        <Text style={styles.contact}>✉ {cvData.personalInfo.email}</Text>
                                    )}
                                    {cvData.personalInfo?.phone && (
                                        <Text style={styles.contact}>📱 {cvData.personalInfo.phone}</Text>
                                    )}
                                    {cvData.personalInfo?.location && (
                                        <Text style={styles.contact}>📍 {cvData.personalInfo.location}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View style={styles.content}>
                        {/* Professional Summary */}
                        {cvData.personalInfo?.summary && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Professional Summary</Text>
                                <Text style={styles.summary}>{cvData.personalInfo.summary}</Text>
                            </View>
                        )}

                        {/* Two Column Layout */}
                        <View style={styles.twoColumn}>
                            {/* Left Column - Experience */}
                            <View style={styles.leftColumn}>
                                {cvData.experience?.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Experience</Text>
                                        {cvData.experience.map((exp, index) => (
                                            <View key={index} style={styles.experienceItem}>
                                                <Text style={styles.jobTitle}>{exp.title}</Text>
                                                <View style={styles.companyInfo}>
                                                    <Text style={styles.company}>{exp.company}</Text>
                                                    {exp.duration && (
                                                        <Text style={styles.duration}>{exp.duration}</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.description}>{exp.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Projects */}
                                {cvData.projects?.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Projects</Text>
                                        {cvData.projects.map((project, index) => (
                                            <View key={index} style={styles.projectItem}>
                                                <Text style={styles.projectName}>{project.name}</Text>
                                                {project.technologies && (
                                                    <Text style={styles.technologies}>
                                                        Technologies: {project.technologies}
                                                    </Text>
                                                )}
                                                <Text style={styles.projectDesc}>{project.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Right Column - Skills & Education */}
                            <View style={styles.rightColumn}>
                                {/* Skills */}
                                {cvData.skills?.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Skills</Text>
                                        <View style={styles.skillsContainer}>
                                            {cvData.skills.map((skill, index) => (
                                                <Text key={index} style={styles.skillTag}>{skill}</Text>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Education */}
                                {cvData.education?.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Education</Text>
                                        {cvData.education.map((edu, index) => (
                                            <View key={index} style={styles.educationItem}>
                                                <Text style={styles.degree}>{edu.degree}</Text>
                                                <Text style={styles.school}>{edu.school}</Text>
                                                {edu.year && <Text style={styles.year}>{edu.year}</Text>}
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Certifications */}
                                {cvData.certifications?.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Certifications</Text>
                                        {cvData.certifications.map((cert, index) => (
                                            <View key={index} style={styles.certItem}>
                                                <Text style={styles.bullet}>•</Text>
                                                <Text>{cert}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Page>
            </Document>
        );

        return CVDocument;
    }

    // Method 3: Download React-PDF
    static async downloadReactPDF(cvData, filename = 'cv.pdf') {
        try {
            const CVDocument = this.createReactPDF(cvData);
            const blob = await pdf(<CVDocument />).toBlob();
            saveAs(blob, filename);
            return { success: true, message: 'CV downloaded successfully!' };
        } catch (error) {
            console.error('React-PDF generation error:', error);
            return { success: false, error: error.message };
        }
    }
}

// File Processing Utilities
export class CVFileProcessor {
    
    // Extract text from uploaded PDF
    static async extractFromPDF(file) {
        try {
            // This would need server-side processing for full PDF parsing
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/extract-pdf', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('PDF extraction failed');
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('PDF extraction error:', error);
            return { success: false, error: error.message };
        }
    }

    // Extract from DOCX files
    static async extractFromDOCX(file) {
        try {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            
            // Parse the extracted text into CV structure
            const parsedData = this.parseExtractedText(result.value);
            return { success: true, data: parsedData };
        } catch (error) {
            console.error('DOCX extraction error:', error);
            return { success: false, error: error.message };
        }
    }

    // Smart text parsing for CV data
    static parseExtractedText(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const cvData = {
            personalInfo: {
                fullName: '',
                email: '',
                phone: '',
                location: '',
                summary: ''
            },
            skills: [],
            experience: [],
            education: []
        };

        // Extract email
        const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) cvData.personalInfo.email = emailMatch[0];

        // Extract phone
        const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) cvData.personalInfo.phone = phoneMatch[0];

        // Extract skills (common patterns)
        const skillsSection = this.extractSection(text, ['skills', 'technical skills', 'competencies']);
        if (skillsSection) {
            cvData.skills = skillsSection
                .split(/[,\n\•\-]/)
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0 && skill.length < 30);
        }

        // Extract experience section
        const experienceSection = this.extractSection(text, ['experience', 'work experience', 'employment']);
        if (experienceSection) {
            cvData.experience = this.parseExperienceSection(experienceSection);
        }

        // Extract education
        const educationSection = this.extractSection(text, ['education', 'academic background']);
        if (educationSection) {
            cvData.education = this.parseEducationSection(educationSection);
        }

        // Assume first non-empty line is name
        cvData.personalInfo.fullName = lines[0] || '';

        return cvData;
    }

    static extractSection(text, keywords) {
        const lowerText = text.toLowerCase();
        for (const keyword of keywords) {
            const index = lowerText.indexOf(keyword);
            if (index !== -1) {
                const nextSectionIndex = this.findNextSection(lowerText, index + keyword.length);
                return text.substring(index, nextSectionIndex);
            }
        }
        return null;
    }

    static findNextSection(text, startIndex) {
        const sectionKeywords = ['experience', 'education', 'skills', 'projects', 'awards'];
        let minIndex = text.length;
        
        for (const keyword of sectionKeywords) {
            const index = text.indexOf(keyword, startIndex + 50); // Skip immediate area
            if (index !== -1 && index < minIndex) {
                minIndex = index;
            }
        }
        
        return minIndex;
    }

    static parseExperienceSection(text) {
        // Basic parsing - can be enhanced
        const experiences = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        for (let i = 1; i < lines.length; i += 3) {
            if (lines[i] && lines[i + 1]) {
                experiences.push({
                    title: lines[i].trim(),
                    company: lines[i + 1]?.trim() || '',
                    duration: '',
                    description: lines[i + 2]?.trim() || ''
                });
            }
        }
        
        return experiences;
    }

    static parseEducationSection(text) {
        const education = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        for (let i = 1; i < lines.length; i += 2) {
            if (lines[i]) {
                education.push({
                    degree: lines[i].trim(),
                    school: lines[i + 1]?.trim() || '',
                    year: ''
                });
            }
        }
        
        return education;
    }
}

// CV Templates with different styles
export const CVTemplates = {
    modern: {
        colors: {
            primary: '#3B82F6',
            secondary: '#1F2937',
            accent: '#F3F4F6'
        },
        fonts: {
            heading: 'Inter, sans-serif',
            body: 'Inter, sans-serif'
        }
    },
    classic: {
        colors: {
            primary: '#1F2937',
            secondary: '#6B7280',
            accent: '#F9FAFB'
        },
        fonts: {
            heading: 'Georgia, serif',
            body: 'Times New Roman, serif'
        }
    },
    creative: {
        colors: {
            primary: '#8B5CF6',
            secondary: '#1F2937',
            accent: '#FAF5FF'
        },
        fonts: {
            heading: 'Poppins, sans-serif',
            body: 'Open Sans, sans-serif'
        }
    },
    minimalist: {
        colors: {
            primary: '#10B981',
            secondary: '#374151',
            accent: '#F0FDF4'
        },
        fonts: {
            heading: 'Helvetica, sans-serif',
            body: 'Arial, sans-serif'
        }
    }
};

// Validation utilities
export const CVValidator = {
    validatePersonalInfo(personalInfo) {
        const errors = [];
        if (!personalInfo.fullName?.trim()) errors.push('Full name is required');
        if (!personalInfo.email?.trim()) errors.push('Email is required');
        if (personalInfo.email && !this.isValidEmail(personalInfo.email)) {
            errors.push('Valid email is required');
        }
        return errors;
    },

    validateCV(cvData) {
        const errors = [];
        errors.push(...this.validatePersonalInfo(cvData.personalInfo || {}));
        
        if (!cvData.skills?.length) errors.push('At least one skill is required');
        if (!cvData.personalInfo?.summary?.trim()) errors.push('Professional summary is required');
        
        return errors;
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
};

// Local storage utilities for CV data
export const CVStorage = {
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
    },

    clear() {
        localStorage.removeItem('cvProfile');
    }
};

export default {
    CVPDFGenerator,
    CVFileProcessor,
    CVTemplates,
    CVValidator,
    CVStorage
}; 