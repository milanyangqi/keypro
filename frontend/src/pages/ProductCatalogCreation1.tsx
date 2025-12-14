import React, { useState, useRef } from 'react';

const ProductCatalogCreation1: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [collectionTitle, setCollectionTitle] = useState('Premium Product Collection');
  const [collectionDescription, setCollectionDescription] = useState('Discover our premium range of cosmetics, meticulously crafted with the finest ingredients and innovative formulations.');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [specs, setSpecs] = useState<Array<{name: string, value: string}>>([{name: '', value: ''}]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const imageUploadRef = useRef<HTMLInputElement>(null);
  const specsContainerRef = useRef<HTMLDivElement>(null);

  // 处理文件上传
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const target = e.target;
          if (target && target.result) {
            setUploadedImages(prev => [...prev, target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 添加参数字段
  const addSpecField = () => {
    setSpecs(prev => [...prev, {name: '', value: ''}]);
  };

  // 移除参数字段
  const removeSpec = (index: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  // 保存产品
  const saveProduct = () => {
    if (uploadedImages.length === 0) {
      alert('请至少上传一张图片');
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: productName,
      description: productDescription,
      specs: specs.filter(spec => spec.name && spec.value),
      image: uploadedImages[0]
    };

    setProducts(prev => [...prev, newProduct]);
    resetForm();
  };

  // 重置表单
  const resetForm = () => {
    setProductName('');
    setProductDescription('');
    setSpecs([{name: '', value: ''}]);
    setUploadedImages([]);
  };

  // 保存页面内容
  const saveCollectionContent = () => {
    // 这里可以添加保存到服务器的逻辑
    alert('页面内容已保存');
  };

  // 删除产品
  const deleteProduct = () => {
    // 这里需要实现删除产品的逻辑，可能需要先选择产品
    alert('删除产品功能待实现');
  };

  // 删除所有产品
  const deleteAllProducts = () => {
    if (window.confirm('确定要删除所有产品吗？')) {
      setProducts([]);
    }
  };

  // 导出PDF
  const exportToPDF = () => {
    alert('导出PDF功能待实现');
  };

  // 截图功能
  const takeScreenshot = () => {
    alert('截图功能待实现');
  };

  return (
    <div style={styles.container}>
      <div style={styles.adminPanel}>
        <div style={styles.innerContainer}>
          <h2 style={styles.adminTitle}>科浦诺产品管理面板</h2>
          
          <div style={styles.adminSection}>
            <h3 style={styles.sectionTitle}>上传产品图片</h3>
            <div style={styles.uploadArea}>
              <i className="fas fa-cloud-upload-alt" style={styles.uploadIcon}></i>
              <p style={styles.uploadText}>拖放图片到这里或点击选择文件</p>
              <input 
                type="file" 
                ref={imageUploadRef}
                accept="image/*" 
                multiple 
                style={styles.hiddenInput}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <button 
                type="button" 
                style={styles.uploadBtn}
                onClick={() => imageUploadRef.current?.click()}
              >
                选择图片
              </button>
            </div>
            <div style={styles.uploadPreview}>
              {uploadedImages.map((image, index) => (
                <div key={index} style={styles.previewItem}>
                  <img src={image} alt={`Preview ${index}`} style={styles.previewImage} />
                  <button 
                    style={styles.removePreview}
                    onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div style={styles.adminSection}>
            <h3 style={styles.sectionTitle}>编辑产品参数</h3>
            <div style={styles.productForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>产品名称:</label>
                <input 
                  type="text" 
                  style={styles.formInput}
                  placeholder="输入产品名称"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>产品描述:</label>
                <textarea 
                  style={styles.formTextarea}
                  placeholder="输入产品描述"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                ></textarea>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>规格参数:</label>
                <div ref={specsContainerRef} style={styles.specsContainer}>
                  {specs.map((spec, index) => (
                    <div key={index} style={styles.specInput}>
                      <input 
                        type="text" 
                        placeholder="参数名称" 
                        style={styles.specInputField}
                        value={spec.name}
                        onChange={(e) => setSpecs(prev => {
                          const newSpecs = [...prev];
                          newSpecs[index].name = e.target.value;
                          return newSpecs;
                        })}
                      />
                      <input 
                        type="text" 
                        placeholder="参数值" 
                        style={styles.specInputField}
                        value={spec.value}
                        onChange={(e) => setSpecs(prev => {
                          const newSpecs = [...prev];
                          newSpecs[index].value = e.target.value;
                          return newSpecs;
                        })}
                      />
                      <button 
                        type="button" 
                        style={styles.removeSpec}
                        onClick={() => removeSpec(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  style={styles.addSpecBtn}
                  onClick={addSpecField}
                >
                  + 添加参数
                </button>
              </div>
              <button 
                type="button" 
                style={styles.saveBtn}
                onClick={saveProduct}
              >
                添加产品
              </button>
            </div>
          </div>
          
          <div style={styles.adminSection}>
            <h3 style={styles.sectionTitle}>编辑页面标题和描述</h3>
            <div style={styles.productForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>页面标题:</label>
                <input 
                  type="text" 
                  style={styles.formInput}
                  placeholder="输入页面标题"
                  value={collectionTitle}
                  onChange={(e) => setCollectionTitle(e.target.value)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>页面描述:</label>
                <textarea 
                  style={styles.formTextarea}
                  placeholder="输入页面描述"
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                ></textarea>
              </div>
              <button 
                type="button" 
                style={styles.saveBtn}
                onClick={saveCollectionContent}
              >
                保存页面内容
              </button>
            </div>
          </div>
        </div>
        
        <div style={styles.innerContainer}>
          <div id="screenshot-container" style={styles.screenshotContainer}>
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle} id="collectionTitleDisplay">{collectionTitle}</h1>
              <p style={styles.pageSubtitle} id="collectionDescriptionDisplay">{collectionDescription}</p>
            </div>
            
            <div style={styles.productsGrid} id="productsGrid">
              {products.map(product => (
                <div key={product.id} style={styles.productCard}>
                  <div style={styles.productImage}>
                    <img src={product.image} alt={product.name} style={styles.productImageImg} />
                  </div>
                  <div style={styles.productContent}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productDescription}>{product.description}</p>
                    <div style={styles.specsTitle}>
                      <i className="fas fa-list"></i>
                      规格参数
                    </div>
                    <ul style={styles.specsList}>
                      {product.specs.map((spec: {name: string, value: string}, index: number) => (
                        <li key={index} style={styles.specItem}>
                          <span style={styles.specName}>{spec.name}:</span>
                          <span style={styles.specValue}>{spec.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button type="button" style={styles.actionBtn} onClick={deleteProduct}>
            <i className="fas fa-trash-alt"></i> 删除产品
          </button>
          <button type="button" style={{...styles.actionBtn, ...styles.deleteBtn}} onClick={deleteAllProducts}>
            <i className="fas fa-trash"></i> 删除所有产品
          </button>
          <button type="button" style={{...styles.actionBtn, ...styles.exportBtn}} onClick={exportToPDF}>
            <i className="fas fa-file-pdf"></i> 导出PDF
          </button>
          <button type="button" style={{...styles.actionBtn, ...styles.screenshotBtn}} onClick={takeScreenshot}>
            <i className="fas fa-camera"></i> 一键截图
          </button>
        </div>
        
        {/* Footer */}
        <div style={styles.pageFooter}>
          <div style={styles.footerContent}>
            <div style={styles.footerLogo}>FREEINS</div>
            
            <div style={styles.footerContact}>
              <div style={styles.contactItem}>
                <i className="fas fa-map-marker-alt"></i>
                <span>China, Zhejiang Province, Yiwu City, Beiyuan Street, Xinhoufu 46 Building, Unit 2, 1st Floor</span>
              </div>
              <div style={styles.contactItem}>
                <i className="fas fa-phone"></i>
                <span>+86 18057943188</span>
              </div>
              <div style={styles.contactItem}>
                <i className="fas fa-envelope"></i>
                <span>sales@freeins.net</span>
              </div>
              <div style={styles.contactItem}>
                <i className="fas fa-globe"></i>
                <span>www.freeins.net</span>
              </div>
            </div>
            
            <div style={styles.footerCopyright}>
              © 2025 Freeins Beauty Team. All Rights Reserved. Freeins Cosmetics · XISJOEM · MIREDO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 样式对象
const styles = {
  container: {
    fontFamily: 'Montserrat, sans-serif',
    background: '#faf7f4',
    color: '#333',
    minHeight: '100vh'
  },
  adminPanel: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '40px 0',
    marginBottom: '40px'
  },
  innerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  adminTitle: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '30px',
    textAlign: 'center' as const
  },
  adminSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '25px',
    backdropFilter: 'blur(10px)'
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '20px',
    color: 'white'
  },
  uploadArea: {
    border: '2px dashed rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  uploadIcon: {
    fontSize: '48px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '15px'
  },
  uploadText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '20px'
  },
  hiddenInput: {
    display: 'none'
  },
  uploadBtn: {
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  uploadPreview: {
    marginTop: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px'
  },
  previewItem: {
    position: 'relative' as const,
    borderRadius: '6px',
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '100px',
    objectFit: 'cover' as const
  },
  removePreview: {
    position: 'absolute' as const,
    top: '5px',
    right: '5px',
    background: 'rgba(255, 0, 0, 0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: '16px',
    lineHeight: '1'
  },
  productForm: {
    display: 'grid',
    gap: '20px'
  },
  formGroup: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '8px'
  },
  formLabel: {
    fontWeight: 600 as const,
    color: 'white'
  },
  formInput: {
    padding: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '14px'
  },
  formTextarea: {
    padding: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '14px',
    height: '80px',
    resize: 'vertical' as const
  },
  specsContainer: {
    marginBottom: '10px'
  },
  specInput: {
    display: 'flex' as const,
    gap: '10px',
    marginBottom: '10px',
    alignItems: 'center' as const
  },
  specInputField: {
    flex: 1,
    padding: '8px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white'
  },
  removeSpec: {
    background: 'rgba(255, 0, 0, 0.6)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: '16px',
    lineHeight: '1'
  },
  addSpecBtn: {
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  saveBtn: {
    padding: '12px 24px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px'
  },
  screenshotContainer: {
    background: '#faf7f4',
    padding: '20px 0 0',
    borderRadius: '12px',
    boxSizing: 'border-box' as const,
    width: '100%',
    position: 'relative' as const
  },
  pageHeader: {
    textAlign: 'center' as const,
    padding: '40px 0',
    background: 'linear-gradient(135deg, #f0e6ff 0%, #ffeff2 100%)',
    borderRadius: '12px',
    margin: '4px auto 40px',
    maxWidth: '1200px',
    width: 'calc(100% - 40px)'
  },
  pageTitle: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '42px',
    fontWeight: 700,
    color: '#3d3b40',
    marginBottom: '15px'
  },
  pageSubtitle: {
    fontSize: '18px',
    color: '#7d7a89',
    maxWidth: '700px',
    margin: '0 auto'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '30px',
    margin: '4px auto 50px',
    maxWidth: '1200px',
    width: 'calc(100% - 40px)'
  },
  productCard: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease'
  },
  productImage: {
    height: '350px',
    width: '100%',
    background: '#f8f7fc',
    display: 'block' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  productImageImg: {
    width: 'calc(100% - 6px)',
    height: 'calc(100% - 6px)',
    objectFit: 'cover' as const,
    display: 'block' as const,
    margin: '3px'
  },
  productContent: {
    padding: '25px'
  },
  productName: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '28px',
    fontWeight: 700,
    color: '#3d3b40',
    marginBottom: '10px'
  },
  productDescription: {
    fontSize: '15px',
    color: '#7d7a89',
    marginBottom: '20px',
    lineHeight: 1.6
  },
  specsTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#3d3b40',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '2px solid #f0e6ff',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '10px'
  },
  specsList: {
    listStyle: 'none' as const,
    padding: 0,
    margin: 0
  },
  specItem: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    padding: '10px 0',
    borderBottom: '1px solid #f5f5f5'
  },
  specName: {
    fontSize: '14px',
    color: '#7d7a89'
  },
  specValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#3d3b40',
    textAlign: 'right' as const
  },
  actionButtons: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    gap: '20px',
    margin: '20px 0',
    padding: '0 20px'
  },
  actionBtn: {
    padding: '15px 30px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '10px',
    background: 'linear-gradient(135deg, #ffa726, #ff9800)',
    color: 'white'
  },
  deleteBtn: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)'
  },
  exportBtn: {
    background: 'linear-gradient(135deg, #4ecdc4, #44a08d)'
  },
  screenshotBtn: {
    background: 'linear-gradient(135deg, #ff6b9d, #ff4f81)'
  },
  pageFooter: {
    background: '#2c3e50',
    color: 'white',
    padding: '40px 0',
    margin: '40px auto 0',
    textAlign: 'center' as const,
    position: 'relative' as const,
    zIndex: 1,
    boxSizing: 'border-box' as const,
    width: '100%',
    maxWidth: '1200px',
    borderRadius: '12px',
    marginTop: '20px'
  },
  footerContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 20px'
  },
  footerLogo: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '20px'
  },
  footerContact: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    gap: '30px',
    marginBottom: '25px',
    flexWrap: 'wrap' as const
  },
  contactItem: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '10px',
    fontSize: '14px'
  },
  footerCopyright: {
    fontSize: '14px',
    color: '#bdc3c7',
    marginTop: '20px'
  }
};

export default ProductCatalogCreation1;