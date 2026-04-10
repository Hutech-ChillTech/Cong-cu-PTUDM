import React, { useEffect, useState } from 'react';
import { Tag as AntTag, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { tagService } from '../../service/tag.service';
import type { Tag } from '../../types/blog.types';
import './TagCloud.css';

interface TagCloudProps {
  limit?: number;
  onTagClick?: (tag: Tag) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ 
  limit = 20, 
  onTagClick 
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, [limit]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await tagService.getITTags();
      setTags(data.slice(0, limit));
    } catch (error) {
      console.error('Error fetching tags:', error);
      message.error('Không thể tải danh sách tags');
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: Tag) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      // Navigate to search page with tag
      navigate(`/search?tag=${tag.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="tag-cloud-loading">
        <Spin />
      </div>
    );
  }

  return (
    <div className="tag-cloud">
      {tags.map((tag) => (
        <AntTag
          key={tag.tagId}
          color="#1890ff"
          className="tag-item"
          onClick={() => handleTagClick(tag)}
          style={{ cursor: 'pointer', margin: '4px' }}
        >
          {tag.name}
        </AntTag>
      ))}
    </div>
  );
};

export default TagCloud;
