import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  IconButton,
  Toolbar,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Image as ImageIcon,
  ColorLens,
  Save,
  Visibility,
  Publish,
  Phone,
  Email,
  Send,
} from '@mui/icons-material';

// Template configurations
const TEMPLATES = {
  professional: {
    name: 'Professional',
    colors: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
    fonts: { heading: 'Roboto', body: 'Open Sans' }
  },
  creative: {
    name: 'Creative',
    colors: { primary: '#7c3aed', secondary: '#5b21b6', accent: '#8b5cf6' },
    fonts: { heading: 'Montserrat', body: 'Lato' }
  },
  minimal: {
    name: 'Minimal',
    colors: { primary: '#059669', secondary: '#047857', accent: '#10b981' },
    fonts: { heading: 'Inter', body: 'Inter' }
  }
};

const TipTapLandingEditor = () => {
  const [activeTemplate, setActiveTemplate] = useState('professional');
  const [pageData, setPageData] = useState({
    title: 'Advanced Web Development Course',
    subtitle: 'Master React, Node.js & Modern Web Technologies',
    price: '$299',
    originalPrice: '$399',
    instructor: 'Sarah Johnson',
    duration: '12 weeks',
    features: ['Hands-on Projects', 'Live Sessions', 'Certificate', '24/7 Support'],
    formFields: [
      { name: 'firstName', label: 'First Name', required: true },
      { name: 'lastName', label: 'Last Name', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'phone', label: 'Phone', required: false }
    ]
  });
  
  const [heroContent, setHeroContent] = useState('');
  const [featuresContent, setFeaturesContent] = useState('');
  const [aboutContent, setAboutContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // TipTap editor for hero section
  const heroEditor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
    ],
    content: `
      <h1>Transform Your Career with Advanced Web Development</h1>
      <p>Join thousands of students who've mastered modern web technologies and landed their dream jobs. Our comprehensive course covers everything from React fundamentals to advanced full-stack development.</p>
      <p><strong>What makes us different:</strong></p>
      <ul>
        <li>🚀 <strong>Real-world projects</strong> - Build a complete portfolio</li>
        <li>👨‍💻 <strong>Expert mentorship</strong> - 1-on-1 code reviews</li>
        <li>🎯 <strong>Job placement assistance</strong> - 90% employment rate</li>
        <li>⏰ <strong>Flexible learning</strong> - Study at your own pace</li>
      </ul>
    `,
    onUpdate: ({ editor }) => {
      setHeroContent(editor.getHTML());
    },
  });

  // TipTap editor for features section
  const featuresEditor = useEditor({
    extensions: [StarterKit, TextStyle, Color],
    content: `
      <h2>Master In-Demand Skills</h2>
      <h3>Frontend Development</h3>
      <p>Build beautiful, responsive user interfaces with <strong>React</strong>, <strong>TypeScript</strong>, and modern CSS frameworks. Learn component architecture, state management, and performance optimization.</p>
      
      <h3>Backend Development</h3>
      <p>Create robust APIs with <strong>Node.js</strong>, <strong>Express</strong>, and database integration. Master authentication, security best practices, and cloud deployment.</p>
      
      <h3>Full-Stack Integration</h3>
      <p>Connect frontend and backend seamlessly. Build complete applications from concept to deployment using industry-standard tools and workflows.</p>
    `,
    onUpdate: ({ editor }) => {
      setFeaturesContent(editor.getHTML());
    },
  });

  // TipTap editor for about instructor
  const aboutEditor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Image],
    content: `
      <h2>Meet Your Instructor</h2>
      <p><strong>Sarah Johnson</strong> is a Senior Full-Stack Developer with 8+ years of experience at top tech companies including Google and Spotify. She's passionate about teaching and has helped over 5,000 students launch their tech careers.</p>
      
      <p><em>"I believe everyone can learn to code with the right guidance and practice. My goal is to make complex concepts simple and enjoyable to learn."</em></p>
      
      <p><strong>Credentials:</strong></p>
      <ul>
        <li>Computer Science degree from Stanford</li>
        <li>Led development teams at Fortune 500 companies</li>
        <li>Published author on web development</li>
        <li>Speaker at international tech conferences</li>
      </ul>
    `,
    onUpdate: ({ editor }) => {
      setAboutContent(editor.getHTML());
    },
  });

  // Editor toolbar component
  const EditorToolbar = ({ editor, title }) => {
    if (!editor) return null;

    const addImage = useCallback(() => {
      const url = window.prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }, [editor]);

    return (
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '4px 4px 0 0', p: 1, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive('bold') ? 'primary' : 'default'}
          >
            <FormatBold />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive('italic') ? 'primary' : 'default'}
          >
            <FormatItalic />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive('bulletList') ? 'primary' : 'default'}
          >
            <FormatListBulleted />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive('orderedList') ? 'primary' : 'default'}
          >
            <FormatListNumbered />
          </IconButton>
          <IconButton size="small" onClick={addImage}>
            <ImageIcon />
          </IconButton>
          <Divider orientation="vertical" flexItem />
          <Button
            size="small"
            onClick={() => editor.chain().focus().setColor('#e74c3c').run()}
            sx={{ minWidth: 'auto', bgcolor: '#e74c3c', width: 24, height: 24, borderRadius: '50%' }}
          />
          <Button
            size="small"
            onClick={() => editor.chain().focus().setColor('#3498db').run()}
            sx={{ minWidth: 'auto', bgcolor: '#3498db', width: 24, height: 24, borderRadius: '50%' }}
          />
          <Button
            size="small"
            onClick={() => editor.chain().focus().setColor('#2ecc71').run()}
            sx={{ minWidth: 'auto', bgcolor: '#2ecc71', width: 24, height: 24, borderRadius: '50%' }}
          />
        </Box>
      </Box>
    );
  };

  // Save functionality
  const handleSave = async () => {
    const landingPageData = {
      ...pageData,
      heroContent: heroEditor?.getHTML(),
      featuresContent: featuresEditor?.getHTML(),
      aboutContent: aboutEditor?.getHTML(),
      template: activeTemplate,
      updatedAt: new Date().toISOString()
    };
    
    // Here you would save to your API
    console.log('Saving landing page:', landingPageData);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 500);
  };

  // Live preview component
  const LivePreview = () => (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box 
              dangerouslySetInnerHTML={{ __html: heroEditor?.getHTML() || '' }}
              sx={{
                '& h1': { fontSize: '2.5rem', fontWeight: 'bold', mb: 2, color: TEMPLATES[activeTemplate].colors.primary },
                '& p': { fontSize: '1.1rem', mb: 2, lineHeight: 1.6 },
                '& ul': { fontSize: '1rem' },
                '& li': { mb: 1 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            {/* Lead Form */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
                Start Learning Today!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                Join {Math.floor(Math.random() * 5000) + 1000}+ students worldwide
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: TEMPLATES[activeTemplate].colors.primary }}>
                  {pageData.price}
                </Typography>
                <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                  {pageData.originalPrice}
                </Typography>
                <Chip label="Limited Time!" color="error" size="small" />
              </Box>

              {pageData.formFields.map((field, index) => (
                <TextField
                  key={index}
                  fullWidth
                  label={field.label}
                  required={field.required}
                  margin="normal"
                  size="medium"
                />
              ))}
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 3, 
                  py: 2, 
                  bgcolor: TEMPLATES[activeTemplate].colors.primary,
                  '&:hover': { bgcolor: TEMPLATES[activeTemplate].colors.secondary }
                }}
                startIcon={<Send />}
              >
                Enroll Now - Start Today!
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                {pageData.features.map((feature, index) => (
                  <Chip key={index} label={feature} size="small" sx={{ m: 0.5 }} variant="outlined" />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box 
          dangerouslySetInnerHTML={{ __html: featuresEditor?.getHTML() || '' }}
          sx={{
            '& h2': { fontSize: '2rem', fontWeight: 'bold', mb: 4, textAlign: 'center', color: TEMPLATES[activeTemplate].colors.primary },
            '& h3': { fontSize: '1.3rem', fontWeight: 'bold', mb: 2, color: TEMPLATES[activeTemplate].colors.secondary },
            '& p': { fontSize: '1rem', mb: 3, lineHeight: 1.6 }
          }}
        />
      </Container>

      {/* About Instructor */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box 
            dangerouslySetInnerHTML={{ __html: aboutEditor?.getHTML() || '' }}
            sx={{
              '& h2': { fontSize: '1.8rem', fontWeight: 'bold', mb: 3, color: TEMPLATES[activeTemplate].colors.primary },
              '& p': { fontSize: '1rem', mb: 2, lineHeight: 1.6 },
              '& em': { fontStyle: 'italic', fontSize: '1.1rem', color: TEMPLATES[activeTemplate].colors.secondary }
            }}
          />
        </Paper>
      </Container>

      {/* Contact */}
      <Box sx={{ bgcolor: TEMPLATES[activeTemplate].colors.primary, color: 'white', py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
            Questions? Get in Touch
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Phone sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6">Call Us</Typography>
              <Typography>+1 (555) 123-4567</Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Email sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6">Email Us</Typography>
              <Typography>hello@courseplatform.com</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );

  if (isPreview) {
    return (
      <Box>
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bgcolor: 'white', zIndex: 1000, borderBottom: '1px solid #e0e0e0', p: 2 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Live Preview</Typography>
              <Button variant="outlined" onClick={() => setIsPreview(false)}>
                Back to Editor
              </Button>
            </Box>
          </Container>
        </Box>
        <Box sx={{ mt: 8 }}>
          <LivePreview />
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Landing Page Editor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isSaved && <Alert severity="success" sx={{ py: 0 }}>Saved!</Alert>}
          <Button variant="outlined" startIcon={<Visibility />} onClick={() => setIsPreview(true)}>
            Preview
          </Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
            Save
          </Button>
          <Button variant="contained" color="success" startIcon={<Publish />}>
            Publish
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Settings Panel */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Page Settings</Typography>
            
            <TextField
              fullWidth
              label="Course Title"
              value={pageData.title}
              onChange={(e) => setPageData({...pageData, title: e.target.value})}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Price"
              value={pageData.price}
              onChange={(e) => setPageData({...pageData, price: e.target.value})}
              margin="normal"
              size="small"
            />

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Template</InputLabel>
              <Select
                value={activeTemplate}
                onChange={(e) => setActiveTemplate(e.target.value)}
              >
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <MenuItem key={key} value={key}>{template.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Form Fields</Typography>
            {pageData.formFields.map((field, index) => (
              <FormControlLabel
                key={index}
                control={<Switch checked={field.required} size="small" />}
                label={field.label}
                sx={{ display: 'block', mb: 1 }}
              />
            ))}
          </Paper>
        </Grid>

        {/* Content Editors */}
        <Grid item xs={12} md={9}>
          {/* Hero Section Editor */}
          <Paper sx={{ mb: 3 }}>
            <EditorToolbar editor={heroEditor} title="Hero Section" />
            <Box sx={{ border: '1px solid #e0e0e0', borderTop: 'none', minHeight: 200 }}>
              <EditorContent 
                editor={heroEditor}
                style={{ 
                  padding: '16px',
                  minHeight: '200px',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
              />
            </Box>
          </Paper>

          {/* Features Section Editor */}
          <Paper sx={{ mb: 3 }}>
            <EditorToolbar editor={featuresEditor} title="Course Features & Benefits" />
            <Box sx={{ border: '1px solid #e0e0e0', borderTop: 'none', minHeight: 200 }}>
              <EditorContent 
                editor={featuresEditor}
                style={{ 
                  padding: '16px',
                  minHeight: '200px',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
              />
            </Box>
          </Paper>

          {/* About Instructor Editor */}
          <Paper sx={{ mb: 3 }}>
            <EditorToolbar editor={aboutEditor} title="About Instructor" />
            <Box sx={{ border: '1px solid #e0e0e0', borderTop: 'none', minHeight: 200 }}>
              <EditorContent 
                editor={aboutEditor}
                style={{ 
                  padding: '16px',
                  minHeight: '200px',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TipTapLandingEditor;