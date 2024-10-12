import { useState } from 'react';

interface BookFormData {
    title: string;
    author: string;
    publishedDate: string;
}

export const useBookForm = () => {
    const [formData, setFormData] = useState<BookFormData>({
        title: '',
        author: '',
        publishedDate: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const resetForm = () => {
        setFormData({ title: '', author: '', publishedDate: '' });
    };

    return { formData, handleInputChange, resetForm };
};
