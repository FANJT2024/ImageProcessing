// 信息显示相关函数
function appendInfo(message) {
    const infoDisplay = document.getElementById('infoDisplay');
    infoDisplay.value += message + '\n';
    infoDisplay.scrollTop = infoDisplay.scrollHeight;
}

function clearInfo() {
    document.getElementById('infoDisplay').value = '';
}

// PDF处理相关函数
function convertPdfToPng() {
    if (!checkPaths()) return;
    appendInfo('开始执行PDF转PNG...');
    // 这里需要实现实际的转换逻辑
    appendInfo('PDF转PNG功能需要后端支持');
}

function mergePdf() {
    if (!checkPaths()) return;
    appendInfo('开始执行PDF合并...');
    // 这里需要实现实际的合并逻辑
    appendInfo('PDF合并功能需要后端支持');
}

// 图片处理相关函数
async function centerImageWithMargin() {
    if (!currentInputPath || currentInputPath.length === 0) {
        appendInfo('请先选择图片文件');
        return;
    }

    const marginSize = parseInt(document.getElementById('marginSize').value);
    appendInfo(`开始执行图片居中留边，边距：${marginSize}像素...`);

    try {
        for (const file of currentInputPath) {
            if (!file.type.startsWith('image/')) {
                appendInfo(`跳过非图片文件: ${file.name}`);
                continue;
            }

            const img = await ImageUtils.loadImage(file);
            const canvas = ImageUtils.centerWithMargin(img, marginSize);
            const blob = await ImageUtils.canvasToBlob(canvas);
            await ImageUtils.saveFile(blob, `centered_${file.name}`);
            appendInfo(`处理完成: ${file.name}`);
        }
        appendInfo('所有图片处理完成');
    } catch (error) {
        appendInfo(`处理出错: ${error.message}`);
    }
}

function addPrefix() {
    if (!checkPaths()) return;
    const prefix = document.getElementById('prefix').value;
    appendInfo(`开始添加前缀：${prefix}...`);
    // 这里需要实现实际的处理逻辑
    appendInfo('添加前缀功能需要后端支持');
}

// 图像调整相关函数
async function resizeByPixel() {
    if (!currentInputPath || currentInputPath.length === 0) {
        appendInfo('请先选择图片文件');
        return;
    }

    const width = document.getElementById('pixelWidth').value;
    const height = document.getElementById('pixelHeight').value;

    if (!width || !height) {
        appendInfo('错误：请设置调整后的宽度和高度');
        return;
    }

    appendInfo(`开始按像素调整大小：${width}x${height}...`);

    try {
        for (const file of currentInputPath) {
            if (!file.type.startsWith('image/')) {
                appendInfo(`跳过非图片文件: ${file.name}`);
                continue;
            }

            const img = await ImageUtils.loadImage(file);
            const canvas = ImageUtils.resize(img, parseInt(width), parseInt(height));
            const blob = await ImageUtils.canvasToBlob(canvas);
            await ImageUtils.saveFile(blob, `resized_${file.name}`);
            appendInfo(`处理完成: ${file.name}`);
        }
        appendInfo('所有图片处理完成');
    } catch (error) {
        appendInfo(`处理出错: ${error.message}`);
    }
}

async function resizeByPercent() {
    if (!currentInputPath || currentInputPath.length === 0) {
        appendInfo('请先选择图片文件');
        return;
    }

    const width = document.getElementById('percentWidth').value;
    const height = document.getElementById('percentHeight').value;

    if (!width || !height) {
        appendInfo('错误：请设置调整后的宽度和高度百分比');
        return;
    }

    appendInfo(`开始按百分比调整大小：${width}%x${height}%...`);

    try {
        for (const file of currentInputPath) {
            if (!file.type.startsWith('image/')) {
                appendInfo(`跳过非图片文件: ${file.name}`);
                continue;
            }

            const img = await ImageUtils.loadImage(file);
            const newWidth = Math.round(img.width * (parseInt(width) / 100));
            const newHeight = Math.round(img.height * (parseInt(height) / 100));
            const canvas = ImageUtils.resize(img, newWidth, newHeight);
            const blob = await ImageUtils.canvasToBlob(canvas);
            await ImageUtils.saveFile(blob, `resized_${file.name}`);
            appendInfo(`处理完成: ${file.name}`);
        }
        appendInfo('所有图片处理完成');
    } catch (error) {
        appendInfo(`处理出错: ${error.message}`);
    }
}

// 图像反色功能
async function invertImage() {
    if (!document.getElementById('invertCheck').checked) {
        appendInfo('请先勾选图像反色选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // 只接受图片文件
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            appendInfo('请选择图片文件');
            return;
        }

        try {
            appendInfo(`开始处理文件: ${file.name}`);

            // 读取图片文件
            const fileData = await file.arrayBuffer();
            
            // 创建图片对象
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = URL.createObjectURL(new Blob([fileData]));
            });

            // 反色处理
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // 绘制原图
            ctx.drawImage(img, 0, 0);
            
            // 获取图像数据
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // 反色处理
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];         // R
                data[i + 1] = 255 - data[i + 1]; // G
                data[i + 2] = 255 - data[i + 2]; // B
            }
            
            // 将处理后的图像数据放回画布
            ctx.putImageData(imageData, 0, 0);

            // 转换为blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.92);
            });

            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `inverted_${file.name}`;
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(img.src);
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo(`处理完成: inverted_${file.name}`);
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 批量处理相关函数
async function cropImage() {
    if (!document.getElementById('cropCheck').checked) {
        appendInfo('请先勾选裁剪图片选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // 只接受图片文件
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            appendInfo('请选择图片文件');
            return;
        }

        try {
            // 获取裁剪参数
            const x = parseInt(document.getElementById('cropX').value);
            const y = parseInt(document.getElementById('cropY').value);
            const width = parseInt(document.getElementById('cropWidth').value) - x;
            const height = parseInt(document.getElementById('cropHeight').value) - y;

            appendInfo(`开始执行图片裁剪，区域：(${x},${y}) ${width}x${height}...`);

            // 读取图片文件
            const fileData = await file.arrayBuffer();
            
            // 创建图片对象
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = URL.createObjectURL(new Blob([fileData]));
            });

            // 裁剪图片
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, -x, -y);

            // 转换为blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.92);
            });

            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `cropped_${file.name}`;
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(img.src);
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo(`处理完成: cropped_${file.name}`);
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 格式转换功能
async function convertFormat() {
    if (!document.getElementById('formatCheck').checked) {
        appendInfo('请先勾选格式转换选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // 只接受图片文件
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            appendInfo('请选择图片文件');
            return;
        }

        try {
            const format = document.getElementById('targetFormat').value;
            appendInfo(`开始执行格式转换为${format.toUpperCase()}...`);

            // 设置不同格式的MIME类型和质量参数
            const formatConfig = {
                'png': { mimeType: 'image/png', quality: 1 },
                'jpeg': { mimeType: 'image/jpeg', quality: 0.92 },
                'webp': { mimeType: 'image/webp', quality: 0.92 },
                'bmp': { mimeType: 'image/bmp', quality: 1 },
                'gif': { mimeType: 'image/gif', quality: 1 },
                'tiff': { mimeType: 'image/tiff', quality: 1 },
                'ico': { mimeType: 'image/x-icon', quality: 1 }
            };

            // 读取图片文件
            const fileData = await file.arrayBuffer();
            
            // 创建图片对象
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = URL.createObjectURL(new Blob([fileData]));
            });

            // 转换格式
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // 获取格式配置
            const { mimeType, quality } = formatConfig[format];

            // 转换为blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, mimeType, quality);
            });

            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            const newFileName = file.name.substring(0, file.name.lastIndexOf('.')) + '.' + format;
            downloadLink.download = newFileName;
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(img.src);
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo(`转换完成: ${newFileName} (${mimeType}, 质量: ${quality * 100}%)`);
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 辅助函数
function checkPaths() {
    if (!currentInputPath || !currentOutputPath) {
        appendInfo('错误：请先设置输入路径和输出路径');
        return false;
    }
    return true;
}

// 组合执行相关函数
function executeSelectedTasks() {
    if (!checkPaths()) return;

    const tasks = [];
    const checkboxes = document.querySelectorAll('.form-check-input:checked');

    checkboxes.forEach(checkbox => {
        tasks.push(checkbox.id.replace('task_', ''));
    });

    if (tasks.length === 0) {
        appendInfo('请至少选择一个任务');
        return;
    }

    appendInfo('开始执行选中的任务：');
    appendInfo(tasks.join(' -> '));

    // 这里需要实现实际的任务执行逻辑
    appendInfo('组合执行功能需要后端支持');
}

function clearSelectedTasks() {
    const checkboxes = document.querySelectorAll('.form-check-input:checked');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateTaskOrder();
}

function updateTaskOrder() {
    const taskOrder = document.getElementById('taskOrder');
    const selectedTasks = [];
    const checkboxes = document.querySelectorAll('.form-check-input:checked');

    checkboxes.forEach(checkbox => {
        const taskName = checkbox.nextElementSibling.textContent.trim();
        selectedTasks.push(taskName);
    });

    if (selectedTasks.length === 0) {
        taskOrder.innerHTML = `
            <div class="alert alert-info">
                请选择要执行的任务，选中的任务将按顺序显示在这里
            </div>
        `;
    } else {
        taskOrder.innerHTML = `
            <div class="alert alert-success">
                执行顺序：${selectedTasks.join(' -> ')}
            </div>
        `;
    }
}

// 调整大小功能
async function resizeImage() {
    if (!document.getElementById('resizeCheck').checked) {
        appendInfo('请先勾选调整大小选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // 只接受图片文件
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            appendInfo('请选择图片文件');
            return;
        }

        try {
            let width, height;
            if (document.getElementById('resizePixel').checked) {
                width = parseInt(document.getElementById('pixelWidth').value);
                height = parseInt(document.getElementById('pixelHeight').value);
                appendInfo(`开始按像素调整大小：${width}x${height}...`);
            } else {
                const percentWidth = parseInt(document.getElementById('percentWidth').value);
                const percentHeight = parseInt(document.getElementById('percentHeight').value);
                appendInfo(`开始按百分比调��大小：${percentWidth}%x${percentHeight}%...`);
            }

            // 读取图片文件
            const fileData = await file.arrayBuffer();
            
            // 创建图片对象
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = URL.createObjectURL(new Blob([fileData]));
            });

            // 计算最终尺寸
            let finalWidth, finalHeight;
            if (document.getElementById('resizePixel').checked) {
                finalWidth = width;
                finalHeight = height;
            } else {
                finalWidth = Math.round(img.width * (parseInt(document.getElementById('percentWidth').value) / 100));
                finalHeight = Math.round(img.height * (parseInt(document.getElementById('percentHeight').value) / 100));
            }

            // 调整大小
            const canvas = document.createElement('canvas');
            canvas.width = finalWidth;
            canvas.height = finalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

            // 转换为blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.92);
            });

            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `resized_${file.name}`;
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(img.src);
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo(`处理完成: resized_${file.name} (${finalWidth}x${finalHeight})`);
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    appendInfo('欢迎使用批处理工具V2.0-FANJT');

    // 禁用调整大小的输入框
    function updateResizeInputs() {
        const isChecked = document.getElementById('resizeCheck').checked;
        const usePixel = document.getElementById('resizePixel').checked;
        
        document.getElementById('pixelWidth').disabled = !isChecked || !usePixel;
        document.getElementById('pixelHeight').disabled = !isChecked || !usePixel;
        document.getElementById('percentWidth').disabled = !isChecked || usePixel;
        document.getElementById('percentHeight').disabled = !isChecked || usePixel;
    }

    // 添加事件监听
    document.getElementById('resizeCheck').addEventListener('change', updateResizeInputs);
    document.getElementById('resizePixel').addEventListener('change', updateResizeInputs);
    document.getElementById('resizePercent').addEventListener('change', updateResizeInputs);

    // 初始化调整大小输入框状态
    updateResizeInputs();

    // 添加自定义输入界面
    $('.sp-container').prepend(`
        <div class="sp-custom-inputs">
            <div class="sp-title">编辑颜色</div>
            <div class="sp-color-preview"></div>
            <div class="sp-input-section">
                <div class="sp-input-group">
                    <label>红色:</label>
                    <input type="number" class="sp-rgb-input" id="sp-r" min="0" max="255" value="0">
                </div>
                <div class="sp-input-group">
                    <label>绿色:</label>
                    <input type="number" class="sp-rgb-input" id="sp-g" min="0" max="255" value="0">
                </div>
                <div class="sp-input-group">
                    <label>蓝色:</label>
                    <input type="number" class="sp-rgb-input" id="sp-b" min="0" max="255" value="0">
                </div>
                <div class="sp-input-group">
                    <label>#</label>
                    <input type="text" class="sp-hex-input" id="sp-hex" value="000000" maxlength="6">
                </div>
            </div>
            <div class="sp-palette-section">
                <div class="sp-palette-title">本颜色</div>
            </div>
        </div>
    `);
    
    // RGB输入框事件处理
    $('.sp-rgb-input').on('input', function() {
        const r = $('#sp-r').val();
        const g = $('#sp-g').val();
        const b = $('#sp-b').val();
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
            $('#colorPicker').spectrum('set', `rgb(${r}, ${g}, ${b})`);
            $('#sp-hex').val(rgbToHex(r, g, b));
        }
    });
    
    // 十六进制输入框事件处理
    $('#sp-hex').on('input', function() {
        const hex = this.value;
        if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
            const rgb = hexToRgb(hex);
            $('#colorPicker').spectrum('set', `#${hex}`);
            updateRGBInputs(rgb.r, rgb.g, rgb.b);
        }
    });
    
    // 更新RGB输入框的值
    function updateRGBInputs(r, g, b) {
        $('#sp-r').val(r);
        $('#sp-g').val(g);
        $('#sp-b').val(b);
        $('#sp-hex').val(rgbToHex(r, g, b));
    }
    
    // RGB转十六进制
    function rgbToHex(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
    
    // 十六进制转RGB
    function hexToRgb(hex) {
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    // 初始化颜色输入框事件监听
    function initColorInputs() {
        // RGB 输入框变化时更新其他输入框和颜色选择器
        ['colorR', 'colorG', 'colorB'].forEach(id => {
            document.getElementById(id).addEventListener('input', function() {
                const r = document.getElementById('colorR').value;
                const g = document.getElementById('colorG').value;
                const b = document.getElementById('colorB').value;
                const color = tinycolor(`rgb(${r}, ${g}, ${b})`);
                updateColorInputs(color, this.id);
            });
        });
        
        // 十六进制输入框变化时更新其他输入框和颜色选择器
        document.getElementById('colorHex').addEventListener('input', function() {
            const hex = this.value;
            if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
                const color = tinycolor(`#${hex}`);
                updateColorInputs(color, 'colorHex');
            }
        });
    }

    // 更新所有颜色输入框的值
    function updateColorInputs(color, skipId = '') {
        const rgb = color.toRgb();
        const hex = color.toHex();
        
        if (skipId !== 'colorR') document.getElementById('colorR').value = rgb.r;
        if (skipId !== 'colorG') document.getElementById('colorG').value = rgb.g;
        if (skipId !== 'colorB') document.getElementById('colorB').value = rgb.b;
        if (skipId !== 'colorHex') document.getElementById('colorHex').value = hex;
        if (skipId !== 'colorPicker') $('#colorPicker').spectrum('set', color.toHexString());
    }

    // 初始化颜色输入框
    initColorInputs();
});

// 图像处理工具函数
const ImageUtils = {
    // 加载图片
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // 创建 canvas 元素
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    // 将 canvas 转换为 Blob
    canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
        return new Promise(resolve => {
            canvas.toBlob(resolve, type, quality);
        });
    },

    // 保存文件
    async saveFile(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    // 调整图像大小
    resize(img, width, height) {
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        return canvas;
    },

    // 图像反色
    invert(img) {
        const canvas = this.createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        
        // 绘制原始图像
        ctx.drawImage(img, 0, 0);
        
        // ���取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 反转颜色
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];         // R
            data[i + 1] = 255 - data[i + 1]; // G
            data[i + 2] = 255 - data[i + 2]; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    },

    // 裁剪图像
    crop(img, x, y, width, height) {
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, -x, -y);
        return canvas;
    },

    // 图像居中留边
    centerWithMargin(img, canvasWidth, canvasHeight, bgColor) {
        const canvas = this.createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');
        
        // 填充背景色
        ctx.fillStyle = bgColor || '#C0C0C0';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // 计算居中位置
        const x = (canvasWidth - img.width) / 2;
        const y = (canvasHeight - img.height) / 2;
        
        // 绘制图像
        ctx.drawImage(img, x, y, img.width, img.height);
        
        return canvas;
    }
};

// 图像居中留边功能
async function centerImage() {
    if (!document.getElementById('centerCheck').checked) {
        appendInfo('请先勾选图像居中留边选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // 只接受图片文件

    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            appendInfo('请选择图片文件');
            return;
        }

        try {
            // 获取参数
            const canvasWidth = parseInt(document.getElementById('canvasWidth').value);
            const canvasHeight = parseInt(document.getElementById('canvasHeight').value);
            const bgColor = document.getElementById('bgColor').value;

            appendInfo(`开始处理文件: ${file.name}`);
            appendInfo(`画布大小: ${canvasWidth}x${canvasHeight}, 背景色: ${bgColor}`);

            // 读取图片文件
            const fileData = await file.arrayBuffer();
            
            // 创建图片对象
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = URL.createObjectURL(new Blob([fileData]));
            });

            // 处理图片
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
            
            // 填充背景色
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // 居中绘制图片
            const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
            const x = (canvasWidth - img.width * scale) / 2;
            const y = (canvasHeight - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // 转换为blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.92);
            });

            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `centered_${file.name}`;
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(img.src);
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo(`处理完成: centered_${file.name}`);
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 组合执行功能
async function executeAll() {
    // 获取所有勾选的功能
    const tasks = [];
    if (document.getElementById('centerCheck').checked) tasks.push('center');
    if (document.getElementById('cropCheck').checked) tasks.push('crop');
    if (document.getElementById('resizeCheck').checked) tasks.push('resize');
    if (document.getElementById('formatCheck').checked) tasks.push('format');
    if (document.getElementById('invertCheck').checked) tasks.push('invert');

    if (tasks.length === 0) {
        appendInfo('请至少选择一个处理功能');
        return;
    }

    // 构建确认信息
    let confirmMessage = '即将执行以下操作：\n\n';
    const taskNames = {
        'center': '居中留边',
        'crop': '裁剪图片',
        'resize': '调整大小',
        'format': '格式转换',
        'invert': '图像反色'
    };
    
    tasks.forEach((task, index) => {
        confirmMessage += `${index + 1}. ${taskNames[task]}\n`;
        // 添加每个任务的具体参数
        switch(task) {
            case 'center':
                confirmMessage += `   ◆ 画布大小: ${document.getElementById('canvasWidth').value}x${document.getElementById('canvasHeight').value}px\n`;
                confirmMessage += `   ◆ 背景颜色: ${document.getElementById('bgColor').value}\n`;
                break;
            case 'crop':
                confirmMessage += `   ◆ 裁剪区域: (${document.getElementById('cropX').value},${document.getElementById('cropY').value}) to (${document.getElementById('cropWidth').value},${document.getElementById('cropHeight').value})\n`;
                break;
            case 'resize':
                if (document.getElementById('resizePixel').checked) {
                    confirmMessage += `   ◆ 调整至: ${document.getElementById('pixelWidth').value}x${document.getElementById('pixelHeight').value}px\n`;
                } else {
                    confirmMessage += `   ◆ 调整至: ${document.getElementById('percentWidth').value}%x${document.getElementById('percentHeight').value}%\n`;
                }
                break;
            case 'format':
                confirmMessage += `   ◆ 目标格式: ${document.getElementById('targetFormat').value.toUpperCase()}\n`;
                break;
        }
    });
  
    confirmMessage += '\n是否继续执行以上操作？';

    // 显示确认对话框
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmMessage').textContent = confirmMessage;
    
    // 等待用户确认
    const confirmed = await new Promise((resolve) => {
        const confirmBtn = document.getElementById('confirmExecute');
        const modalElement = document.getElementById('confirmModal');
        
        const handleConfirm = () => {
            modal.hide();
            resolve(true);
            cleanup();
        };
        
        const handleCancel = () => {
            resolve(false);
            cleanup();
        };
        
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            modalElement.removeEventListener('hidden.bs.modal', handleCancel);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        modalElement.addEventListener('hidden.bs.modal', handleCancel);
        
        modal.show();
    });

    // 如果用户取消，则终止程序
    if (!confirmed) {
        appendInfo('用户取消了操作');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            appendInfo('未选择任何图片文件');
            return;
        }

        try {
            appendInfo(`开始批量处理 ${files.length} 个文件...`);
            appendInfo('执行顺序: ' + tasks.join(' -> '));

            // 处理每个图片
            for (const file of files) {
                try {
                    appendInfo(`\n处理文件: ${file.name}`);
                    
                    // 读取图片文件
                    const fileData = await file.arrayBuffer();
                    
                    // 创建初始图片对象
                    let img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = URL.createObjectURL(new Blob([fileData]));
                    });

                    let canvas = document.createElement('canvas');
                    let ctx;

                    // 按顺序执行每个任务
                    for (const task of tasks) {
                        switch (task) {
                            case 'center':
                                appendInfo('执行居中留边...');
                                const canvasWidth = parseInt(document.getElementById('canvasWidth').value);
                                const canvasHeight = parseInt(document.getElementById('canvasHeight').value);
                                const bgColor = document.getElementById('bgColor').value;
                                
                                canvas.width = canvasWidth;
                                canvas.height = canvasHeight;
                                ctx = canvas.getContext('2d');
                                
                                // 填充背景色
                                ctx.fillStyle = bgColor;
                                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                                
                                // 居中绘制图片
                                const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
                                const x = (canvasWidth - img.width * scale) / 2;
                                const y = (canvasHeight - img.height * scale) / 2;
                                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                                break;

                            case 'crop':
                                appendInfo('执行裁剪...');
                                const cropX = parseInt(document.getElementById('cropX').value);
                                const cropY = parseInt(document.getElementById('cropY').value);
                                const cropWidth = parseInt(document.getElementById('cropWidth').value) - cropX;
                                const cropHeight = parseInt(document.getElementById('cropHeight').value) - cropY;
                                
                                canvas = document.createElement('canvas');
                                canvas.width = cropWidth;
                                canvas.height = cropHeight;
                                ctx = canvas.getContext('2d');
                                ctx.drawImage(img, -cropX, -cropY);
                                break;

                            case 'resize':
                                appendInfo('执行调整大小...');
                                let finalWidth, finalHeight;
                                if (document.getElementById('resizePixel').checked) {
                                    finalWidth = parseInt(document.getElementById('pixelWidth').value);
                                    finalHeight = parseInt(document.getElementById('pixelHeight').value);
                                } else {
                                    const percentWidth = parseInt(document.getElementById('percentWidth').value);
                                    const percentHeight = parseInt(document.getElementById('percentHeight').value);
                                    finalWidth = Math.round(img.width * (percentWidth / 100));
                                    finalHeight = Math.round(img.height * (percentHeight / 100));
                                }
                                
                                canvas = document.createElement('canvas');
                                canvas.width = finalWidth;
                                canvas.height = finalHeight;
                                ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
                                break;

                            case 'invert':
                                appendInfo('执行反色...');
                                canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                const data = imageData.data;
                                for (let i = 0; i < data.length; i += 4) {
                                    data[i] = 255 - data[i];         // R
                                    data[i + 1] = 255 - data[i + 1]; // G
                                    data[i + 2] = 255 - data[i + 2]; // B
                                }
                                ctx.putImageData(imageData, 0, 0);
                                break;
                        }

                        // 更新图片对象为当前处理结果
                        img = await new Promise((resolve) => {
                            const image = new Image();
                            image.onload = () => resolve(image);
                            image.src = canvas.toDataURL();
                        });
                    }

                    // 最终格式转换和保存
                    const format = document.getElementById('formatCheck').checked ? 
                        document.getElementById('targetFormat').value : 'jpeg';
                    
                    const formatConfig = {
                        'png': { mimeType: 'image/png', quality: 1 },
                        'jpeg': { mimeType: 'image/jpeg', quality: 0.92 },
                        'webp': { mimeType: 'image/webp', quality: 0.92 },
                        'bmp': { mimeType: 'image/bmp', quality: 1 },
                        'gif': { mimeType: 'image/gif', quality: 1 },
                        'tiff': { mimeType: 'image/tiff', quality: 1 },
                        'ico': { mimeType: 'image/x-icon', quality: 1 }
                    };

                    // 转换为blob
                    const { mimeType, quality } = formatConfig[format];
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, mimeType, quality);
                    });

                    // 创建下载链接
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(blob);
                    const newFileName = `processed_${file.name.substring(0, file.name.lastIndexOf('.'))}${format === 'jpeg' ? '.jpg' : '.' + format}`;
                    downloadLink.download = newFileName;
                    
                    // 触发下载
                    downloadLink.click();
                    
                    // 清理资源
                    URL.revokeObjectURL(img.src);
                    URL.revokeObjectURL(downloadLink.href);
                    
                    appendInfo(`已处理完成: ${newFileName}`);
                } catch (error) {
                    appendInfo(`处理文件 ${file.name} 时出错: ${error.message}`);
                    return;
                }
            }

            appendInfo('单文件组合处理完成！');
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 批量图像反色功能
async function invertImageMulti() {
    if (!document.getElementById('invertCheck').checked) {
        appendInfo('请先勾选图像反色选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true; // 允许多选
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            appendInfo('未选择任何图片文件');
            return;
        }

        try {
            appendInfo(`开始批量处理 ${files.length} 个文件...`);
            
            // 创建zip文件
            const zip = new JSZip();

            // 处理每个图片
            for (const file of files) {
                try {
                    appendInfo(`\n处理文件: ${file.name}`);
                    
                    // 读取图片文件
                    const fileData = await file.arrayBuffer();
                    
                    // 创建图片对象
                    const img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = URL.createObjectURL(new Blob([fileData]));
                    });

                    // 反色处理
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    // 绘制原图
                    ctx.drawImage(img, 0, 0);
                    
                    // 获取图像数据
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // 反色处理
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = 255 - data[i];         // R
                        data[i + 1] = 255 - data[i + 1]; // G
                        data[i + 2] = 255 - data[i + 2]; // B
                    }
                    
                    // 将处理后的图像数据放回画布
                    ctx.putImageData(imageData, 0, 0);

                    // 转换为blob
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, 'image/jpeg', 0.92);
                    });

                    // 添加到zip
                    zip.file(`inverted_${file.name}`, blob);

                    // 清理资源
                    URL.revokeObjectURL(img.src);
                    
                    appendInfo(`已处理完成: inverted_${file.name}`);
                } catch (error) {
                    appendInfo(`处理文件 ${file.name} 时出错: ${error.message}`);
                    continue;
                }
            }

            // 生成zip文件
            appendInfo('\n正在打包处理后的文件...');
            const zipBlob = await zip.generateAsync({type: 'blob'});
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = 'inverted_images.zip';
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo('批量处理完成！文件已打包下载');
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 批量居中留边功能
async function centerImageMulti() {
    if (!document.getElementById('centerCheck').checked) {
        appendInfo('请先勾选图像居中留边选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            appendInfo('未选择任何图片文件');
            return;
        }

        try {
            appendInfo(`开始批量处理 ${files.length} 个文件...`);
            
            // 创建zip文件
            const zip = new JSZip();

            // 获取参数
            const canvasWidth = parseInt(document.getElementById('canvasWidth').value);
            const canvasHeight = parseInt(document.getElementById('canvasHeight').value);
            const bgColor = document.getElementById('bgColor').value;

            // 处理每个图片
            for (const file of files) {
                try {
                    appendInfo(`\n处理文件: ${file.name}`);
                    
                    // 读取图片文件
                    const fileData = await file.arrayBuffer();
                    
                    // 创建图片对象
                    const img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = URL.createObjectURL(new Blob([fileData]));
                    });

                    // 居中处理
                    const canvas = document.createElement('canvas');
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    const ctx = canvas.getContext('2d');
                    
                    // 填充背景色
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    
                    // 居中绘制图片
                    const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
                    const x = (canvasWidth - img.width * scale) / 2;
                    const y = (canvasHeight - img.height * scale) / 2;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    // 转换为blob
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, 'image/jpeg', 0.92);
                    });

                    // 添加到zip
                    zip.file(`centered_${file.name}`, blob);

                    // 清理资源
                    URL.revokeObjectURL(img.src);
                    
                    appendInfo(`已处理完成: centered_${file.name}`);
                } catch (error) {
                    appendInfo(`处理文件 ${file.name} 时出错: ${error.message}`);
                    continue;
                }
            }

            // 生成zip文件
            appendInfo('\n正在打包处理后的文件...');
            const zipBlob = await zip.generateAsync({type: 'blob'});
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = 'centered_images.zip';
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo('批量处理完成！文件已打包下载');
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 批量裁剪功能
async function cropImageMulti() {
    if (!document.getElementById('cropCheck').checked) {
        appendInfo('请先勾选裁剪图片选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            appendInfo('未选择任何图片文件');
            return;
        }

        try {
            // 获取裁剪参数
            const x = parseInt(document.getElementById('cropX').value);
            const y = parseInt(document.getElementById('cropY').value);
            const width = parseInt(document.getElementById('cropWidth').value) - x;
            const height = parseInt(document.getElementById('cropHeight').value) - y;

            appendInfo(`开始批量处理 ${files.length} 个文件...`);
            
            // 创建zip文件
            const zip = new JSZip();

            // 处理每个图片
            for (const file of files) {
                try {
                    appendInfo(`\n处理文件: ${file.name}`);
                    
                    // 读取图片文件
                    const fileData = await file.arrayBuffer();
                    
                    // 创建图片对象
                    const img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = URL.createObjectURL(new Blob([fileData]));
                    });

                    // 裁剪处理
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, -x, -y);

                    // 转换为blob
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, 'image/jpeg', 0.92);
                    });

                    // 添加到zip
                    zip.file(`cropped_${file.name}`, blob);

                    // 清理资源
                    URL.revokeObjectURL(img.src);
                    
                    appendInfo(`已处理完成: cropped_${file.name}`);
                } catch (error) {
                    appendInfo(`处理文件 ${file.name} 时出错: ${error.message}`);
                    continue;
                }
            }

            // 生成zip文件
            appendInfo('\n正在打包处理后的文件...');
            const zipBlob = await zip.generateAsync({type: 'blob'});
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = 'cropped_images.zip';
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo('批量处理完成！文件已打包下载');
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 批量调整大小功能
async function resizeImageMulti() {
    if (!document.getElementById('resizeCheck').checked) {
        appendInfo('请先勾选调整大小选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            appendInfo('未选择任何图片文件');
            return;
        }

        try {
            let finalWidth, finalHeight;
            if (document.getElementById('resizePixel').checked) {
                finalWidth = parseInt(document.getElementById('pixelWidth').value);
                finalHeight = parseInt(document.getElementById('pixelHeight').value);
                appendInfo(`开始批量调整大小至：${finalWidth}x${finalHeight}px...`);
            } else {
                const percentWidth = parseInt(document.getElementById('percentWidth').value);
                const percentHeight = parseInt(document.getElementById('percentHeight').value);
                appendInfo(`开始批量调整大小至：${percentWidth}%x${percentHeight}%...`);
            }

            // 创建zip文件
            const zip = new JSZip();

            // 处理每个图片
            for (const file of files) {
                try {
                    appendInfo(`\n处理文件: ${file.name}`);
                    
                    // 读取图片文件
                    const fileData = await file.arrayBuffer();
                    
                    // 创建图片对象
                    const img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = URL.createObjectURL(new Blob([fileData]));
                    });

                    // 计算最终尺寸
                    let targetWidth, targetHeight;
                    if (document.getElementById('resizePixel').checked) {
                        targetWidth = finalWidth;
                        targetHeight = finalHeight;
                    } else {
                        const percentWidth = parseInt(document.getElementById('percentWidth').value);
                        const percentHeight = parseInt(document.getElementById('percentHeight').value);
                        targetWidth = Math.round(img.width * (percentWidth / 100));
                        targetHeight = Math.round(img.height * (percentHeight / 100));
                    }

                    // 调整大小
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                    // 转换为blob
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, 'image/jpeg', 0.92);
                    });

                    // 添加到zip
                    zip.file(`resized_${file.name}`, blob);

                    // 清理资源
                    URL.revokeObjectURL(img.src);
                    
                    appendInfo(`已处理完成: resized_${file.name}`);
                } catch (error) {
                    appendInfo(`处理文件 ${file.name} 时出错: ${error.message}`);
                    continue;
                }
            }

            // 生成zip文件
            appendInfo('\n正在打包处理后的文件...');
            const zipBlob = await zip.generateAsync({type: 'blob'});
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = 'resized_images.zip';
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo('批量处理完成！文件已打包下载');
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 批量格式转换功能
async function convertFormatMulti() {
    if (!document.getElementById('formatCheck').checked) {
        appendInfo('请先勾选格式转换选项');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            appendInfo('未选择任何图片文件');
            return;
        }

        try {
            const format = document.getElementById('targetFormat').value;
            appendInfo(`开始批量转换为${format.toUpperCase()}格式...`);

            // 设置不同格式的MIME类型和质量参数
            const formatConfig = {
                'png': { mimeType: 'image/png', quality: 1 },
                'jpeg': { mimeType: 'image/jpeg', quality: 0.92 },
                'webp': { mimeType: 'image/webp', quality: 0.92 },
                'bmp': { mimeType: 'image/bmp', quality: 1 },
                'gif': { mimeType: 'image/gif', quality: 1 },
                'tiff': { mimeType: 'image/tiff', quality: 1 },
                'ico': { mimeType: 'image/x-icon', quality: 1 }
            };
            
            // 创建zip文件
            const zip = new JSZip();

            // 处理每个图片
            for (const file of files) {
                try {
                    appendInfo(`\n处理文件: ${file.name}`);
                    
                    // 读取图片文件
                    const fileData = await file.arrayBuffer();
                    
                    // 创建图片对象
                    const img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = URL.createObjectURL(new Blob([fileData]));
                    });

                    // 转换格式
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // 获取格式配置
                    const { mimeType, quality } = formatConfig[format];

                    // 转换为blob
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, mimeType, quality);
                    });

                    // 添加到zip
                    const newFileName = `${file.name.substring(0, file.name.lastIndexOf('.'))}${format === 'jpeg' ? '.jpg' : '.' + format}`;
                    zip.file(newFileName, blob);

                    // 清理资源
                    URL.revokeObjectURL(img.src);
                    
                    appendInfo(`已处理完成: ${newFileName}`);
                } catch (error) {
                    appendInfo(`处理文件 ${file.name} 时出错: ${error.message}`);
                    continue;
                }
            }

            // 生成zip文件
            appendInfo('\n正在打包处理后的文件...');
            const zipBlob = await zip.generateAsync({type: 'blob'});
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = `converted_images_${format}.zip`;
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo('批量处理完成！文件已打包下载');
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
}

// 批量组合执行功能
async function executeAllMulti() {
    // 获取所有勾选的功能
    const tasks = [];
    if (document.getElementById('centerCheck').checked) tasks.push('center');
    if (document.getElementById('cropCheck').checked) tasks.push('crop');
    if (document.getElementById('resizeCheck').checked) tasks.push('resize');
    if (document.getElementById('formatCheck').checked) tasks.push('format');
    if (document.getElementById('invertCheck').checked) tasks.push('invert');

    if (tasks.length === 0) {
        appendInfo('请至少选择一个处理功能');
        return;
    }

    // 构建确认信息
    let confirmMessage = '即将执行以下操作：\n\n';
    const taskNames = {
        'center': '居中留边',
        'crop': '裁剪图片',
        'resize': '调整大小',
        'format': '格式转换',
        'invert': '图像反色'
    };
    
    tasks.forEach((task, index) => {
        confirmMessage += `${index + 1}. ${taskNames[task]}\n`;
        // 添加每个任务的具体参数
        switch(task) {
            case 'center':
                confirmMessage += `   ◆ 画布大小: ${document.getElementById('canvasWidth').value}x${document.getElementById('canvasHeight').value}px\n`;
                confirmMessage += `   ◆ 背景颜色: ${document.getElementById('bgColor').value}\n`;
                break;
            case 'crop':
                confirmMessage += `   ◆ 裁剪区域: (${document.getElementById('cropX').value},${document.getElementById('cropY').value}) to (${document.getElementById('cropWidth').value},${document.getElementById('cropHeight').value})\n`;
                break;
            case 'resize':
                if (document.getElementById('resizePixel').checked) {
                    confirmMessage += `   ◆ 调整至: ${document.getElementById('pixelWidth').value}x${document.getElementById('pixelHeight').value}px\n`;
                } else {
                    confirmMessage += `   ◆ 调整至: ${document.getElementById('percentWidth').value}%x${document.getElementById('percentHeight').value}%\n`;
                }
                break;
            case 'format':
                confirmMessage += `   ◆ 目标格式: ${document.getElementById('targetFormat').value.toUpperCase()}\n`;
                break;
        }
    });

    confirmMessage += '\n是否继续执行以上操作？';

    // 显示确认对话框
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmMessage').textContent = confirmMessage;
    
    // 等待用户确认
    const confirmed = await new Promise((resolve) => {
        const confirmBtn = document.getElementById('confirmExecute');
        const modalElement = document.getElementById('confirmModal');
        
        const handleConfirm = () => {
            modal.hide();
            resolve(true);
            cleanup();
        };
        
        const handleCancel = () => {
            resolve(false);
            cleanup();
        };
        
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            modalElement.removeEventListener('hidden.bs.modal', handleCancel);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        modalElement.addEventListener('hidden.bs.modal', handleCancel);
        
        modal.show();
    });

    // 如果用户取消，则终止程序
    if (!confirmed) {
        appendInfo('用户取消了操作');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', async function(e) {
        if (e.target.files.length === 0) {
            appendInfo('未选择文件');
            return;
        }

        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            appendInfo('未选择任何图片文件');
            return;
        }

        try {
            appendInfo(`开始批量处理 ${files.length} 个文件...`);
            appendInfo('执行顺序: ' + tasks.join(' -> '));

            // 创建zip文件
            const zip = new JSZip();
            
            // 处理每个图片
            for (const file of files) {
                try {
                    appendInfo(`\n处理文件: ${file.name}`);
                    
                    // 读取图片文件
                    const fileData = await file.arrayBuffer();
                    
                    // 创建初始图片对象
                    let img = await new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = () => resolve(image);
                        image.onerror = reject;
                        image.src = URL.createObjectURL(new Blob([fileData]));
                    });

                    let canvas = document.createElement('canvas');
                    let ctx;

                    // 按顺序执行每个任务
                    for (const task of tasks) {
                        switch (task) {
                            case 'center':
                                appendInfo('执行居中留边...');
                                const canvasWidth = parseInt(document.getElementById('canvasWidth').value);
                                const canvasHeight = parseInt(document.getElementById('canvasHeight').value);
                                const bgColor = document.getElementById('bgColor').value;
                                
                                canvas.width = canvasWidth;
                                canvas.height = canvasHeight;
                                ctx = canvas.getContext('2d');
                                
                                // 填充背景色
                                ctx.fillStyle = bgColor;
                                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                                
                                // 居中绘制图片
                                const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
                                const x = (canvasWidth - img.width * scale) / 2;
                                const y = (canvasHeight - img.height * scale) / 2;
                                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                                break;

                            case 'crop':
                                appendInfo('执行裁剪...');
                                const cropX = parseInt(document.getElementById('cropX').value);
                                const cropY = parseInt(document.getElementById('cropY').value);
                                const cropWidth = parseInt(document.getElementById('cropWidth').value) - cropX;
                                const cropHeight = parseInt(document.getElementById('cropHeight').value) - cropY;
                                
                                canvas = document.createElement('canvas');
                                canvas.width = cropWidth;
                                canvas.height = cropHeight;
                                ctx = canvas.getContext('2d');
                                ctx.drawImage(img, -cropX, -cropY);
                                break;

                            case 'resize':
                                appendInfo('执行调整大小...');
                                let finalWidth, finalHeight;
                                if (document.getElementById('resizePixel').checked) {
                                    finalWidth = parseInt(document.getElementById('pixelWidth').value);
                                    finalHeight = parseInt(document.getElementById('pixelHeight').value);
                                } else {
                                    const percentWidth = parseInt(document.getElementById('percentWidth').value);
                                    const percentHeight = parseInt(document.getElementById('percentHeight').value);
                                    finalWidth = Math.round(img.width * (percentWidth / 100));
                                    finalHeight = Math.round(img.height * (percentHeight / 100));
                                }
                                
                                canvas = document.createElement('canvas');
                                canvas.width = finalWidth;
                                canvas.height = finalHeight;
                                ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
                                break;

                            case 'invert':
                                appendInfo('执行反色...');
                                canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                const data = imageData.data;
                                for (let i = 0; i < data.length; i += 4) {
                                    data[i] = 255 - data[i];         // R
                                    data[i + 1] = 255 - data[i + 1]; // G
                                    data[i + 2] = 255 - data[i + 2]; // B
                                }
                                ctx.putImageData(imageData, 0, 0);
                                break;
                        }

                        // 更新图片对象为当前处理结果
                        img = await new Promise((resolve) => {
                            const image = new Image();
                            image.onload = () => resolve(image);
                            image.src = canvas.toDataURL();
                        });
                    }

                    // 最终格式转换和保存
                    const format = document.getElementById('formatCheck').checked ? 
                        document.getElementById('targetFormat').value : 'jpeg';
                    
                    const formatConfig = {
                        'png': { mimeType: 'image/png', quality: 1 },
                        'jpeg': { mimeType: 'image/jpeg', quality: 0.92 },
                        'webp': { mimeType: 'image/webp', quality: 0.92 },
                        'bmp': { mimeType: 'image/bmp', quality: 1 },
                        'gif': { mimeType: 'image/gif', quality: 1 },
                        'tiff': { mimeType: 'image/tiff', quality: 1 },
                        'ico': { mimeType: 'image/x-icon', quality: 1 }
                    };

                    // 转换为blob
                    const { mimeType, quality } = formatConfig[format];
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, mimeType, quality);
                    });

                    // 添加到zip
                    const newFileName = `processed_${file.name.substring(0, file.name.lastIndexOf('.'))}${format === 'jpeg' ? '.jpg' : '.' + format}`;
                    zip.file(newFileName, blob);

                    // 清理资源
                    URL.revokeObjectURL(img.src);
                    
                    appendInfo(`已处理完成: ${newFileName}`);
                } catch (error) {
                    appendInfo(`处理文件 ${file.name} 时出错: ${error.message}`);
                    continue;
                }
            }

            // 生成zip文件
            appendInfo('\n正在打包处理后的文件...');
            const zipBlob = await zip.generateAsync({type: 'blob'});
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = 'processed_images.zip';
            
            // 触发下载
            downloadLink.click();
            
            // 清理资源
            URL.revokeObjectURL(downloadLink.href);
            
            appendInfo('批量组合处理完成！文件已打包下载');
        } catch (error) {
            appendInfo(`处理出错: ${error.message}`);
        }
    });

    // 触发文件选择
    input.click();
} 