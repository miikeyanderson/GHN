import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  createdAt: string;
}

const ResourceLibrary = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Placeholder data - will be replaced with API call
  const resources: Resource[] = [
    {
      id: '1',
      title: 'WHO Guidelines on Health Systems',
      description: 'Comprehensive guidelines for health system strengthening',
      category: 'guidelines',
      url: '#',
      createdAt: '2025-01-01',
    },
    {
      id: '2',
      title: 'Healthcare Worker Training Manual',
      description: 'Training materials for healthcare professionals',
      category: 'training',
      url: '#',
      createdAt: '2025-01-02',
    },
    {
      id: '3',
      title: 'Medical Equipment Catalog',
      description: 'Catalog of essential medical equipment',
      category: 'equipment',
      url: '#',
      createdAt: '2025-01-03',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'guidelines', label: 'Guidelines' },
    { id: 'training', label: 'Training Materials' },
    { id: 'equipment', label: 'Equipment' },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="resource-library">
      <div className="resource-header">
        <h1>Resource Library</h1>
        <div className="resource-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="resource-grid">
        {filteredResources.map(resource => (
          <div key={resource.id} className="resource-card">
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            <div className="resource-meta">
              <span className="resource-category">{resource.category}</span>
              <span className="resource-date">
                {new Date(resource.createdAt).toLocaleDateString()}
              </span>
            </div>
            <a href={resource.url} className="resource-link" target="_blank" rel="noopener noreferrer">
              View Resource
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceLibrary;
